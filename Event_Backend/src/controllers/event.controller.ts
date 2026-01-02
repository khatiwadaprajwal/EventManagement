import { Request, Response } from 'express';
import * as eventService from '../services/event.service';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

export const createEvent = catchAsync(async (req: Request, res: Response) => {
  const event = await eventService.createEvent(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Event created and seats generated successfully',
    data: { event },
  });
});

export const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const { events, total } = await eventService.getAllEvents(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Events fetched successfully',
    data: { 
      meta: { total, page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 10 },
      events 
    },
  });
});

export const getEvent = catchAsync(async (req: Request, res: Response) => {
  const event = await eventService.getEvent(Number(req.params.id));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { event },
  });
});

export const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  await eventService.deleteEvent(Number(req.params.id));

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event deleted successfully',
  });
});