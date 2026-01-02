import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import  prisma  from '../config/db'; 
import { AppError } from '../utils/AppError';
import { User as PrismaUser, UserRole } from '@prisma/client';

// 1. AUTHENTICATION (Protect)
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number; role: string };

    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid Token', 401));
  }
};

// 2. AUTHORIZATION (RBAC)
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    
    const user = req.user as PrismaUser; 

    if (!user) {
      return next(new AppError('User not authenticated', 401));
    }

    // Now TypeScript is happy because 'PrismaUser' definitely has a 'role'
    if (!roles.includes(user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};