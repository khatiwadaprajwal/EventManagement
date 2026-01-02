import { Router } from 'express';
import authRoutes from './auth.routes';
// import userRoutes from './user.routes'; // Future
import eventRoutes from './event.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
const router = Router();

// Mount Auth Routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
// Mount User Routes (Example)
// router.use('/users', userRoutes);

// Mount Event Routes (Example)
// router.use('/events', eventRoutes);

export default router;