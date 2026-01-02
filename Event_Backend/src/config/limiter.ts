import rateLimit from 'express-rate-limit';

// 1. Auth Limiter (Strict)
// Use for: Login, Register, Change Password
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 attempts per IP
  message: { 
    success: false, 
    message: "Too many login/signup attempts. Please try again after 15 minutes." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Password Reset Limiter (Very Strict)
// Use for: Forgot Password, Reset Password (Prevent brute forcing security answers)
export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 5, // Only 5 attempts to guess security answers
  message: {
    success: false,
    message: "Too many password reset attempts. Account protected for 1 hour."
  }
});

// 3. Booking Limiter (Moderate)
// Use for: Create Booking, Initiate Payment (Prevent seat hoarding/spam)
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 20, // Max 20 bookings per hour per IP
  message: {
    success: false,
    message: "You are making too many bookings. Please slow down."
  }
});

// 4. Global API Limiter (Loose)
// Use in app.ts for ALL routes to prevent DDoS
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests allowed
  message: {
    success: false,
    message: "Too many requests from this IP."
  }
});