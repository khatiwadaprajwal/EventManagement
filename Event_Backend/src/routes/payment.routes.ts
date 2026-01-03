import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { protect } from '../middlewares/auth.middleware';
import { bookingLimiter } from '../config/limiter';
import { initiatePaymentSchema } from '../validators/payment.schema';
import { validate } from '../middlewares/validate.middleware';
const router = Router();


router.post('/initiate',bookingLimiter, protect,validate(initiatePaymentSchema), paymentController.initiatePayment);


router.get('/khalti/callback', paymentController.khaltiCallback);
router.get('/paypal/success', paymentController.paypalSuccess);

export default router;