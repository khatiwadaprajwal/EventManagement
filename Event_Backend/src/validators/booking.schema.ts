import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    eventId: z.number().int().positive(),
    seatIds: z.array(z.number().int().positive()).min(1, "Select at least one seat"),
  }),
});