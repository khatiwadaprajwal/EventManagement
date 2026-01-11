import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { env } from '../config/env';
import { User as PrismaUser, User } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenGenerate';
import { sendResponse } from '../utils/sendResponse'; // ✅ Imported


export const googleCallback = catchAsync(async (req: Request, res: Response) => {
  
  const user = req.user as User; 

  if (!user) {
    return res.redirect(`${env.CLIENT_URL}/login?error=auth_failed`);
  }


  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);


  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
  });


  res.redirect(`${env.CLIENT_URL}/auth/success?token=${accessToken}`);
});


export const register = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

 
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Registration successful',
    token: accessToken,
    data: { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      } 
    },
  });
});

// --- LOGIN ---
export const login = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Login successful',
    token: accessToken,
    data: { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      } 
    },
  });
});

// --- REFRESH ---
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    throw new Error('No Refresh Token Provided');
  }

  const { accessToken } = await authService.refreshAccessToken(cookies.refreshToken);


  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Token refreshed successfully',
    token: accessToken,
  });
});

// --- LOGOUT ---
export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logged out successfully',
  });
};