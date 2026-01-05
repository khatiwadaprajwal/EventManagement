import cron from 'node-cron';
import prisma from '../config/db';

export const startCleanupJob = () => {
  // Run every 1 minute
  cron.schedule('* * * * *', async () => {
    // console.log('⏳ Checking for expired bookings...');

    try {
      const currentTime = new Date();

      // 1. Find Bookings that are PENDING and EXPIRED
      const expiredBookings = await prisma.booking.findMany({
        where: {
          status: 'PENDING',
          expiresAt: { lt: currentTime }, // Time has passed
        },
        include: {
          tickets: true, // We need this to know which seats to unlock
        },
      });

      if (expiredBookings.length === 0) return;

      console.log(`Found ${expiredBookings.length} expired bookings. Cleaning up...`);

      // 2. Collect all Seat IDs that need to be released
      // We map through bookings, then through tickets to get seatIds
      const seatIdsToRelease = expiredBookings.flatMap((booking) => 
        booking.tickets.map((ticket) => ticket.seatId)
      );

      // 3. Extract Booking IDs to update
      const bookingIdsToCancel = expiredBookings.map((b) => b.id);

      // 4. Execute Updates in a Transaction (All or Nothing)
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

        
        prisma.booking.updateMany({
          where: { id: { in: bookingIdsToCancel } },
          data: { status: 'CANCELLED' }, 
        }),
      ]);

      console.log(`✅ released ${seatIdsToRelease.length} seats and cancelled ${bookingIdsToCancel.length} bookings.`);

    } catch (error) {
      console.error('❌ Error in cleanup job:', error);
    }
  });
};