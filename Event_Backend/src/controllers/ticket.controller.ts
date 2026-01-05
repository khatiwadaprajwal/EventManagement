import { Request, Response } from 'express';
import * as ticketService from '../services/ticket.service';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AppError } from '../utils/AppError';

// GET /tickets/verify/:qrCode
export const verifyTicket = catchAsync(async (req: Request, res: Response) => {
  const { qrCode } = req.params;

  if (!qrCode) {
    throw new AppError('QR Code is required', 400);
  }

 
  const result = await ticketService.verifyTicket(qrCode);


  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message || 'Ticket Valid', // Use message from service if available
    data: result,
  });
});