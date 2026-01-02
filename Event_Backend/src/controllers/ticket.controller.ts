import { Request, Response } from 'express';
import * as ticketService from '../services/ticket.service';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

export const verifyTicket = catchAsync(async (req: Request, res: Response) => {
  const { qrCode } = req.params;
  const result = await ticketService.verifyTicket(qrCode);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Ticket Valid',
    data: result,
  });
});