import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createBookingSchema } from '../validators/booking.schema';

const router = Router();

// All booking routes require login
router.use(protect);

router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.get('/', bookingController.getMyBookings);
router.get('/:id', bookingController.getBooking);

export default router;