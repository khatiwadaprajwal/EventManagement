import { z } from 'zod';

// PATCH /users/me
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    // Avatar is handled by Multer, so we don't validate it here
  }),
});

