import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { User as PrismaUser } from '@prisma/client';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number };

    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!currentUser) {
      return next(new AppError('User no longer exists', 401));
    }

    req.user = currentUser as PrismaUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid Token', 401));
  }
};