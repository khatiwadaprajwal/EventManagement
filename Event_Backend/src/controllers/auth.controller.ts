import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { env } from '../config/env';
import { User as PrismaUser } from '@prisma/client';
// Import utils for the Google Callback flow
import { generateAccessToken, generateRefreshToken } from '../utils/tokenGenerate';

export class AuthController {
  
  // --- GOOGLE CALLBACK ---
  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as PrismaUser;

      if (!user) {
        return res.redirect(`${env.CLIENT_URL}/login?error=auth_failed`);
      }

      // Generate tokens here (since Passport only returned the User object)
      const accessToken = generateAccessToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id, user.role);

      // We usually send the Access Token in URL, but Refresh Token in Cookies
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend with Access Token
      res.redirect(`${env.CLIENT_URL}/auth/success?token=${accessToken}`);
    } catch (error) {
      next(error);
    }
  }

  // --- REGISTER ---
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Service now returns tokens too
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      
      // Set Cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        status: 'success',
        token: accessToken,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // --- LOGIN ---
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: 'success',
        token: accessToken,
        data: { 
          id: user.id,
          email: user.email,
          role: user.role
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // --- REFRESH ---
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const cookies = req.cookies;
      if (!cookies?.refreshToken) {
        return res.status(401).json({ message: 'No Refresh Token Provided' });
      }

      const { accessToken } = await authService.refreshAccessToken(cookies.refreshToken);

      res.status(200).json({
        status: 'success',
        token: accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- LOGOUT ---
  logout(req: Request, res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    res.status(200).json({ message: 'Logged out successfully' });
  }
}

export const authController = new AuthController();