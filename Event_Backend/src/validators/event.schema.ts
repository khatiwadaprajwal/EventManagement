import { z } from 'zod';

// Define structure for Seat Tiers
const seatTierSchema = z.object({
  category: z.string().min(1), // e.g., "VIP"
  price: z.coerce.number().positive(),
  count: z.coerce.number().min(1),
});

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    location: z.string().min(2),
    date: z.coerce.date().refine((date) => date > new Date(), {
      message: 'Event date must be in the future',
    }),
    
    
    seatConfig: z.string().transform((str, ctx) => {
      try {
        return z.array(seatTierSchema).parse(JSON.parse(str));
      } catch (e) {
        ctx.addIssue({ code: 'custom', message: 'Invalid seatConfig JSON format' });
        return z.NEVER;
      }
    }),
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    date: z.coerce.date().optional(),
  }),
});