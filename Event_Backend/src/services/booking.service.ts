import prisma from '../config/db';
import { AppError } from '../utils/AppError';

// --- CREATE BOOKING ---
export const createBooking = async (userId: number, eventId: number, seatIds: number[]) => {
  return await prisma.$transaction(async (tx) => {
    
   
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Event not found', 404);

  
    const currentTime = new Date();
    const lockDuration = 15 * 60 * 1000; // 15 Minutes
    const lockExpiresAt = new Date(currentTime.getTime() + lockDuration);

    const lockedSeatsCount = await tx.seat.updateMany({
      where: {
        id: { in: seatIds },
        eventId: eventId,
        OR: [
          { status: 'AVAILABLE' },
          { status: 'LOCKED', lockExpiresAt: { lt: currentTime } } // Expired lock
        ]
      },
      data: {
        status: 'LOCKED',
        userId: userId,
        lockExpiresAt: lockExpiresAt,
      }
    });

  
    if (lockedSeatsCount.count !== seatIds.length) {
      throw new AppError('One or more selected seats are no longer available.', 409);
    }


    await tx.ticket.deleteMany({
      where: {
        seatId: { in: seatIds }
      }
    });

    // D. Calculate Total Price
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
        expiresAt: lockExpiresAt, 
        // Now valid because we deleted the old tickets above
        tickets: {
          create: seatIds.map((seatId) => ({
            seatId: seatId,
            qrCode: `TICKET-${Date.now()}-${seatId}`,
          })),
        },
      },
      include: {
        tickets: { include: { seat: true } }
      }
    });

    // F. Return info
    return { 
      booking, 
      expiresAt: lockExpiresAt,
      seats: lockedSeats.map(s => ({
        seatNumber: s.seatNumber,
        category: s.category,
        price: s.price
      }))
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
  
  if (booking.userId !== userId) throw new AppError('Unauthorized', 403);

  return booking;
};