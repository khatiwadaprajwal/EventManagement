import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import ticketRoutes from './ticket.routes';
import eventRoutes from './event.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import passwordRoutes from './password.routes';
const router = Router();

// Mount Auth Routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);
router.use('/password', passwordRoutes);

// Mount Event Routes (Example)
// router.use('/events', eventRoutes);

export default router;