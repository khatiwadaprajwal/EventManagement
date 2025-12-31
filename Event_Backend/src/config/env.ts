import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

// Define schema for Env Variables
const envSchema = z.object({
  PORT: z.string().default('8000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // ✅ Added DATABASE_URL validation
  // .url() checks if it actually looks like a URL (starts with postgres:// etc)
   DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
   JWT_SECRET: z.string().min(10),
   REFRESH_SECRET: z.string().min(10),
   JWT_EXPIRES_IN: z.string().default('1d'),
   GOOGLE_CLIENT_ID: z.string().min(1),
   GOOGLE_CLIENT_SECRET: z.string().min(1),
   GOOGLE_CALLBACK_URL: z.string().url(),
    // Frontend URL for redirecting after OAuth success
   CLIENT_URL: z.string().url().default('http://localhost:3000')

});

// Validate
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1); // Stop the app if variables are missing
}

export const env = _env.data;