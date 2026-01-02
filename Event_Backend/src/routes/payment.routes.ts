import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();


router.post('/initiate', protect, paymentController.initiatePayment);


router.get('/khalti/callback', paymentController.khaltiCallback);
router.get('/paypal/success', paymentController.paypalSuccess);

export default router;