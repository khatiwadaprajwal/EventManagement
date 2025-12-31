import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Generate Short-Lived Access Token (e.g., 15 mins)
 * Used for authorizing API requests
 */
export const generateAccessToken = (userId: number, role: string): string => {
  return jwt.sign(
    { id: userId, role }, 
    env.JWT_SECRET, 
    { expiresIn: '15m' } // Standard security practice
  );
};

/**
 * Generate Long-Lived Refresh Token (e.g., 7 days)
 * Used to get a new Access Token without logging in again
 */
export const generateRefreshToken = (userId: number, role: string): string => {
  return jwt.sign(
    { id: userId, role }, 
    env.REFRESH_SECRET, 
    { expiresIn: '7d' }
  );
};