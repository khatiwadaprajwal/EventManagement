import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  body: z.object({

    bookingId: z.number().positive(),

    gateway: z.enum(['KHALTI', 'PAYPAL']),
  }),
});