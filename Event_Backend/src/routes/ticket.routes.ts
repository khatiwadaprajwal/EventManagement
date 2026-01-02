import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();


router.get('/verify/:qrCode', protect, restrictTo('ADMIN', 'ORGANIZER'), ticketController.verifyTicket);

export default router;