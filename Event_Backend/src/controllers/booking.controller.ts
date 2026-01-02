import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { User as PrismaUser } from '@prisma/client';

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as PrismaUser; // Guaranteed by middleware
  const { eventId, seatIds } = req.body;

  const result = await bookingService.createBooking(user.id, eventId, seatIds);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Seats locked successfully. Please proceed to payment.',
    data: result,
  });
});

export const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as PrismaUser;
  const bookings = await bookingService.getMyBookings(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { bookings },
  });
});

export const getBooking = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as PrismaUser;
  const booking = await bookingService.getBooking(Number(req.params.id), user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { booking },
  });
});