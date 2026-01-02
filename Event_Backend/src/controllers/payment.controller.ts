import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { env } from '../config/env';
import { User as PrismaUser } from '@prisma/client';

// 1. Initiate
export const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as PrismaUser;
  const { bookingId, gateway } = req.body; // gateway: 'KHALTI' or 'PAYPAL'

  const result = await paymentService.initiatePayment(bookingId, user.id, gateway);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Redirect to ${gateway}`,
    data: result, // Frontend will redirect window.location.href = result.url
  });
});

// 2. Khalti Callback
export const khaltiCallback = catchAsync(async (req: Request, res: Response) => {
 
  const { pidx, status, purchase_order_id } = req.query;

  if (!pidx || status !== 'Completed' || !purchase_order_id) {
    return res.redirect(`${env.CLIENT_URL}/payment/failed`);
  }


  await paymentService.verifyKhalti(pidx as string, Number(purchase_order_id));

  return res.redirect(`${env.CLIENT_URL}/payment/success`);
});

// 3. PayPal Success
export const paypalSuccess = catchAsync(async (req: Request, res: Response) => {
  const { paymentId, PayerID, bookingId } = req.query;

  if (!paymentId || !PayerID || !bookingId) {
    return res.redirect(`${env.CLIENT_URL}/payment/failed`);
  }

  await paymentService.verifyPayPal(paymentId as string, PayerID as string, Number(bookingId));

  return res.redirect(`${env.CLIENT_URL}/payment/success`);
});