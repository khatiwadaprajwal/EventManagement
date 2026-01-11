import jwt from 'jsonwebtoken';
import { env } from '../config/env';


export const generateAccessToken = (userId: number, role: string): string => {
  return jwt.sign(
    { id: userId, role }, 
    env.JWT_SECRET, 
    { expiresIn: '15m' } // Standard security practice
  );
};


export const generateRefreshToken = (userId: number, role: string): string => {
  return jwt.sign(
    { id: userId, role }, 
    env.REFRESH_SECRET, 
    { expiresIn: '7d' }
  );
};