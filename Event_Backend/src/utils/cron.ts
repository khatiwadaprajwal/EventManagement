import cron from 'node-cron';
import  prisma  from '../config/db';

export const startCleanupJob = () => {
  // Run every 1 minute ("* * * * *")
  cron.schedule('* * * * *', async () => {
    console.log('⏳ Running Seat Cleanup Job...');

    try {
      const currentTime = new Date();

      // Find seats that are LOCKED but the time has passed
      const expiredSeats = await prisma.seat.updateMany({
        where: {
          status: 'LOCKED',
          lockExpiresAt: { lt: currentTime }, // Expired
        },
        data: {
          status: 'AVAILABLE',
          userId: null,         // Remove the user
          lockExpiresAt: null,  // Remove the timer
        },
      });

      if (expiredSeats.count > 0) {
        console.log(`🔓 Released ${expiredSeats.count} expired seats.`);
        
        // Optional: You could also mark the associated Bookings as 'CANCELLED' here
        // But for now, just freeing the seats is enough.
      }
    } catch (error) {
      console.error('❌ Error in cleanup job:', error);
    }
  });
};