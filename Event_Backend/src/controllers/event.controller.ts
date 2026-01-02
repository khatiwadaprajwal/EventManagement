import { Request, Response } from 'express';
import * as eventService from '../services/event.service';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

import { uploadToCloudinary } from '../utils/cloudinary'; // Import util
import { AppError } from '../utils/AppError';



export const createEvent = catchAsync(async (req: Request, res: Response) => {
  // Typescript cast for Multer fields
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // 1. Upload Banner (Required)
  if (!files || !files['banner']) {
    throw new AppError('Banner image is required', 400);
  }
  const bannerUpload = await uploadToCloudinary(files['banner'][0].buffer, 'ticket-hive/events');
  req.body.bannerUrl = bannerUpload.url;

  // 2. Upload Gallery (Optional)
  if (files['gallery']) {
    const galleryPromises = files['gallery'].map(file => 
      uploadToCloudinary(file.buffer, 'ticket-hive/events')
    );
    const galleryUploads = await Promise.all(galleryPromises);
    req.body.images = galleryUploads.map(res => res.url);
  }

  // 3. Create Event
  const event = await eventService.createEvent(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Event created successfully',
    data: { event },
  });
});

export const updateEvent = catchAsync(async (req: Request, res: Response) => {
  // Handle optional banner update
  if (req.file) {
     const { url } = await uploadToCloudinary(req.file.buffer, 'ticket-hive/events');
     req.body.bannerUrl = url;
  }

  const event = await eventService.updateEvent(Number(req.params.id), req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event updated successfully',
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