import cron from 'node-cron';
import prisma from '../config/db';

export const startCleanupJob = () => {
  // Run every 1 minute
  cron.schedule('* * * * *', async () => {
    try {
      const currentTime = new Date();

      // 1. Find Bookings that are PENDING and EXPIRED
      const expiredBookings = await prisma.booking.findMany({
        where: {
          status: 'PENDING',
          expiresAt: { lt: currentTime }, 
        },
        include: {
          tickets: true, 
        },
      });

      if (expiredBookings.length === 0) return;

      console.log(`Found ${expiredBookings.length} expired bookings. Cleaning up...`);

      // 2. Collect IDs
      const seatIdsToRelease = expiredBookings.flatMap((booking) => 
        booking.tickets.map((ticket) => ticket.seatId)
      );

      const bookingIdsToCancel = expiredBookings.map((b) => b.id);

      // 3. Execute Updates in a Transaction
      await prisma.$transaction([
        
        // Step A: Release the Seats
        prisma.seat.updateMany({
          where: { id: { in: seatIdsToRelease } },
          data: {
            status: 'AVAILABLE',
            userId: null,
            lockExpiresAt: null,
          },
        }),

        // 🛠️ Step B: DELETE THE GHOST TICKETS
        // This stops the unique constraint error for future bookings
        prisma.ticket.deleteMany({
          where: { 
            bookingId: { in: bookingIdsToCancel } 
          }
        }),

        // Step C: Cancel the Bookings
        prisma.booking.updateMany({
          where: { id: { in: bookingIdsToCancel } },
          data: { status: 'CANCELLED' }, 
        }),
      ]);

      console.log(`✅ Released ${seatIdsToRelease.length} seats, deleted tickets, and cancelled bookings.`);

    } catch (error) {
      console.error('❌ Error in cleanup job:', error);
    }
  });
};