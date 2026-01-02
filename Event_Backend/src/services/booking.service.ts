import  prisma  from '../config/db';
import { AppError } from '../utils/AppError';

export const createBooking = async (userId: number, eventId: number, seatIds: number[]) => {
  return await prisma.$transaction(async (tx) => {
    
    // A. Validate Event
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Event not found', 404);

    // B. Check & Lock Seats
    const currentTime = new Date();
    const lockDuration = 15 * 60 * 1000; // 15 Minutes
    const lockExpiresAt = new Date(currentTime.getTime() + lockDuration);

    const lockedSeatsCount = await tx.seat.updateMany({
      where: {
        id: { in: seatIds },
        eventId: eventId,
        OR: [
          { status: 'AVAILABLE' },
          { status: 'LOCKED', lockExpiresAt: { lt: currentTime } }
        ]
      },
      data: {
        status: 'LOCKED',
        userId: userId,
        lockExpiresAt: lockExpiresAt,
      }
    });

    // C. Verification
    if (lockedSeatsCount.count !== seatIds.length) {
      throw new AppError('One or more selected seats are no longer available.', 409);
    }

    // D. Calculate Total Price & Fetch Details
    const lockedSeats = await tx.seat.findMany({
      where: { id: { in: seatIds } }
    });

    const totalAmount = lockedSeats.reduce((sum, seat) => sum + Number(seat.price), 0);

    // E. Create Booking
    const booking = await tx.booking.create({
      data: {
        userId,
        eventId,
        totalAmount,
        status: 'PENDING',
      }
    });

    // F. Return info for Payment (✅ IMPROVED)
    return { 
      booking, 
      expiresAt: lockExpiresAt,
      // Now returns more details for the UI
      seats: lockedSeats.map(s => ({
        seatNumber: s.seatNumber,
        category: s.category, // e.g. "VIP"
        price: s.price
      }))
    };
  });
};

// --- GET MY BOOKINGS ---
// No change needed here! 
// Since 'include: { seat: true }' fetches all fields, 
// Prisma will automatically start returning the new 'category' field.
export const getMyBookings = async (userId: number) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      event: {
        select: { title: true, date: true, location: true, bannerUrl: true }
      },
      tickets: {
        include: { seat: true } // Will automatically include seat.category
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
  
  if (booking.userId !== userId) throw new AppError('Unauthorized', 403);

  return booking;
};