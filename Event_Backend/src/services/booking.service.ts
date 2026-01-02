import  prisma  from '../config/db';
import { AppError } from '../utils/AppError';
import { BookingStatus, SeatStatus } from '@prisma/client';

export const createBooking = async (userId: number, eventId: number, seatIds: number[]) => {
  // 1. Start a Transaction (All or Nothing)
  return await prisma.$transaction(async (tx) => {
    
    // A. Validate Event exists
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Event not found', 404);

    // B. Check & Lock Seats (CRITICAL STEP)
    // We try to update ONLY if they are available OR if the previous lock expired
    const currentTime = new Date();
    const lockDuration = 15 * 60 * 1000; // 15 Minutes
    const lockExpiresAt = new Date(currentTime.getTime() + lockDuration);

    const lockedSeatsCount = await tx.seat.updateMany({
      where: {
        id: { in: seatIds },
        eventId: eventId,
        OR: [
          { status: 'AVAILABLE' }, // It's free
          { 
            status: 'LOCKED', 
            lockExpiresAt: { lt: currentTime } // Or the previous locker took too long
          }
        ]
      },
      data: {
        status: 'LOCKED',
        userId: userId, // Lock it for this user
        lockExpiresAt: lockExpiresAt,
      }
    });

    // C. Verification
    // If we requested 3 seats, but only locked 2, it means someone else stole 1 seat just now.
    if (lockedSeatsCount.count !== seatIds.length) {
      throw new AppError('One or more selected seats are no longer available. Please try again.', 409);
    }

    // D. Calculate Total Price
    // Fetch the updated seats to get the price
    const lockedSeats = await tx.seat.findMany({
      where: { id: { in: seatIds } }
    });

    const totalAmount = lockedSeats.reduce((sum, seat) => sum + Number(seat.price), 0);

    // E. Create the Booking Record (PENDING)
    const booking = await tx.booking.create({
      data: {
        userId,
        eventId,
        totalAmount,
        status: 'PENDING',
        // We link tickets later after payment, OR we can link them now as placeholders
        // For this architecture, let's create placeholders
      }
    });

    // F. Return info for Payment
    return { 
      booking, 
      expiresAt: lockExpiresAt,
      seats: lockedSeats.map(s => s.seatNumber) 
    };
  });
};

// --- GET MY BOOKINGS ---
export const getMyBookings = async (userId: number) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      event: {
        select: { title: true, date: true, location: true, bannerUrl: true }
      },
      tickets: {
        include: { seat: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

// --- GET BOOKING DETAILS ---
export const getBooking = async (bookingId: number, userId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      event: true,
      tickets: { include: { seat: true } },
      payment: true
    }
  });

  if (!booking) throw new AppError('Booking not found', 404);
  
  // Security Check: Ensure user owns this booking
  if (booking.userId !== userId) throw new AppError('Unauthorized', 403);

  return booking;
};