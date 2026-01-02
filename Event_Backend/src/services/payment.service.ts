import axios from 'axios';
import  prisma  from '../config/db';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { BookingStatus, PaymentStatus, SeatStatus } from '@prisma/client';

// Exchange Rate
const EXCHANGE_RATE_NPR_TO_USD = 135;

// --- HELPER: Generate PayPal Token ---
const generatePayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(
      `${env.PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    throw new AppError('Failed to generate PayPal Access Token', 500);
  }
};

// =========================================
// 1. INITIATE PAYMENT
// =========================================
export const initiatePayment = async (bookingId: number, userId: number, gateway: 'KHALTI' | 'PAYPAL') => {
  // 1. Fetch Booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true },
  });

  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.userId !== userId) throw new AppError('Unauthorized', 403);
  if (booking.status === 'CONFIRMED') throw new AppError('Booking already paid', 400);

  // 2. Handle KHALTI
  if (gateway === 'KHALTI') {
    const amountInPaisa = Number(booking.totalAmount) * 100;
    
    const paymentData = {
      return_url: `http://localhost:8000/v1/payments/khalti/callback`,
      website_url: env.CLIENT_URL,
      amount: amountInPaisa,
      purchase_order_id: booking.id.toString(), // We send ID here
      purchase_order_name: `Booking #${booking.id}`,
      customer_info: {
        name: booking.user.name || 'Customer',
        email: booking.user.email,
      },
    };

    const headers = {
      Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post('https://a.khalti.com/api/v2/epayment/initiate/', paymentData, { headers });
      return { url: response.data.payment_url };
    } catch (error: any) {
      console.error('Khalti Init Error:', error.response?.data);
      throw new AppError('Khalti initiation failed', 500);
    }
  }

  // 3. Handle PAYPAL
  if (gateway === 'PAYPAL') {
    const accessToken = await generatePayPalAccessToken();
    const usdAmount = (Number(booking.totalAmount) / EXCHANGE_RATE_NPR_TO_USD).toFixed(2);

    const paymentData = {
      intent: 'sale',
      payer: { payment_method: 'paypal' },
      redirect_urls: {
        return_url: `http://localhost:8000/v1/payments/paypal/success?bookingId=${booking.id}`,
        cancel_url: `${env.CLIENT_URL}/payment/cancel`,
      },
      transactions: [{
        amount: { currency: 'USD', total: usdAmount },
        description: `Booking #${booking.id}`,
      }],
    };

    try {
      const response = await axios.post(`${env.PAYPAL_API}/v1/payments/payment`, paymentData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const approvalUrl = response.data.links.find((link: any) => link.rel === 'approval_url').href;
      return { url: approvalUrl };
    } catch (error: any) {
      console.error('PayPal Init Error:', error.response?.data);
      throw new AppError('PayPal initiation failed', 500);
    }
  }

  throw new AppError('Invalid Gateway', 400);
};

// =========================================
// 2. VERIFY KHALTI (Callback)
// =========================================
export const verifyKhalti = async (pidx: string,  bookingId: number) => {
  const headers = { Authorization: `Key ${env.KHALTI_SECRET_KEY}` };
  
  let verification;
  try {
    const response = await axios.post('https://a.khalti.com/api/v2/epayment/lookup/', { pidx }, { headers });
    verification = response.data;
  } catch (error) {
    throw new AppError('Payment verification failed', 500);
  }

  if (verification.status !== 'Completed') {
    throw new AppError('Payment not completed', 400);
  }


  
  if (!bookingId || isNaN(bookingId)) {
    throw new AppError('Invalid Booking ID returned from Khalti', 400);
  }

  return await finalizeBooking(bookingId, pidx, 'KHALTI', Number(verification.total_amount) / 100);
};

// =========================================
// 3. VERIFY PAYPAL (Success URL)
// =========================================
export const verifyPayPal = async (paymentId: string, payerId: string, bookingId: number) => {
  // ✅ FIX: Validate bookingId input immediately
  if (!bookingId || isNaN(bookingId)) {
    throw new AppError('Invalid Booking ID for PayPal verification', 400);
  }

  const accessToken = await generatePayPalAccessToken();
  const executeUrl = `${env.PAYPAL_API}/v1/payments/payment/${paymentId}/execute`;

  try {
    const response = await axios.post(executeUrl, { payer_id: payerId }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.data.state !== 'approved') {
      throw new AppError('PayPal payment not approved', 400);
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new AppError('Booking not found', 404);

    return await finalizeBooking(bookingId, paymentId, 'PAYPAL', Number(booking.totalAmount));

  } catch (error) {
    throw new AppError('PayPal execution failed', 500);
  }
};

// =========================================
// 4. CORE LOGIC: FINALIZE BOOKING (DB Transaction)
// =========================================
const finalizeBooking = async (bookingId: number, transactionId: string, gateway: string, amount: number) => {
  
  // 1. Input Validation
  if (!bookingId || isNaN(bookingId)) {
    throw new AppError('Cannot finalize booking: Invalid ID', 500);
  }

  return await prisma.$transaction(async (tx) => {
    // A. Idempotency Check (Prevent processing same payment twice)
    const existingPayment = await tx.payment.findUnique({ where: { transactionId } });
    if (existingPayment) return existingPayment; 

    // B. Fetch Booking
    const booking = await tx.booking.findUnique({
        where: { id: bookingId } 
    });

    if (!booking) throw new AppError('Booking not found', 404);

    
    if (Number(booking.totalAmount) > amount) {
        throw new AppError(
            `Payment Amount Mismatch. Expected: ${booking.totalAmount}, Received: ${amount}. Transaction flagged.`, 
            400
        );
    }

    
    const payment = await tx.payment.create({
      data: {
        bookingId,
        transactionId,
        gateway,
        amount,
        status: 'COMPLETED',
      },
    });

    // E. Update Booking Status
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    
    await tx.seat.updateMany({
      where: {
        eventId: booking.eventId,
        userId: booking.userId,
        status: 'LOCKED',
      },
      data: {
        status: 'BOOKED',
        lockExpiresAt: null, 
      },
    });

   
    const seats = await tx.seat.findMany({
        where: { eventId: booking.eventId, userId: booking.userId, status: 'BOOKED' }
    });

    for (const seat of seats) {
       
        const exists = await tx.ticket.findFirst({ where: { seatId: seat.id } });
        if (!exists) {
            await tx.ticket.create({
                data: {
                    bookingId,
                    seatId: seat.id,
                   
                    qrCode: `TICKET-${bookingId}-${seat.id}-${Math.random().toString(36).substring(7).toUpperCase()}`
                }
            });
        }
    }

    return { payment, status: 'SUCCESS' };
  });
};