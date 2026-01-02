import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    location: z.string().min(2, 'Location is required'),
    date: z.coerce.date().refine((date) => date > new Date(), {
      message: 'Event date must be in the future',
    }),
    bannerUrl: z.string().url().optional(),
    
    totalSeats: z.number().min(1).max(1000).optional().default(50),
    pricePerSeat: z.number().positive('Price must be positive'),
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    date: z.coerce.date().optional(),
    bannerUrl: z.string().url().optional(),
  }),
});