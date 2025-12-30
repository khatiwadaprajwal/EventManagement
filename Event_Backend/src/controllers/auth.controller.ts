import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { env } from '../config/env';
import { User as PrismaUser } from '@prisma/client';

export class AuthController {
  
  // Google Callback
  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as PrismaUser; // Type assertion

      if (!user) {
        return res.redirect(`${env.CLIENT_URL}/login?error=auth_failed`);
      }

      const token = authService.generateToken(user.id, user.role as string);

      res.redirect(`${env.CLIENT_URL}/auth/success?token=${token}`);
    } catch (error) {
      next(error);
    }
  }

  // Local Register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      const token = authService.generateToken(user.id, user.role);

      res.status(201).json({
        status: 'success',
        token,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Local Login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.login(req.body);
      const token = authService.generateToken(user.id, user.role);

      res.status(200).json({
        status: 'success',
        token,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();