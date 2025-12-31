import { Router } from 'express';
import authRoutes from './auth.routes';
// import userRoutes from './user.routes'; // Future

const router = Router();

// Mount Auth Routes
router.use('/auth', authRoutes);

// Mount User Routes (Example)
// router.use('/users', userRoutes);

// Mount Event Routes (Example)
// router.use('/events', eventRoutes);

export default router;