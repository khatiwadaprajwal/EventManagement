import { z } from 'zod';

// 1. Setup Questions (Authenticated)
export const setupSecurityQuestionsSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    questions: z.array(
      z.object({
        question: z.string().min(5),
        answer: z.string().min(1),
      })
    ).length(3, "You must provide exactly 3 questions"),
  }),
});

// 2. Get Questions (Public - Step 1 of Forgot Password)
export const getSecurityQuestionsSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

// 3. Reset Password (Public - Step 2 of Forgot Password)
export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    newPassword: z.string().min(6),
    
     // Structure: { "1": "Fido", "2": "Kathmandu" }
    answers: z.record(z.string(), z.string()), 
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  }),
});