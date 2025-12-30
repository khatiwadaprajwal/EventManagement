import prisma from '../config/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { AuthProvider } from '@prisma/client';
import { AppError } from '../utils/AppError';

interface SocialProfile {
  email: string;
  name: string;
  provider: AuthProvider;
  providerId: string;
  avatar?: string;
}

export class AuthService {
  /**
   * Handle Google OAuth Login/Signup
   */
  async handleSocialLogin(profile: SocialProfile) {
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      if (existingUser.provider !== profile.provider) {
        throw new AppError(
          `Account already exists with ${existingUser.provider} provider. Please login with that method.`,
          400
        );
      }
      return existingUser;
    }

    return prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        provider: profile.provider,
        providerId: profile.providerId,
        role: 'USER',
      },
    });
  }

  /**
   * Handle Local Registration (Email/Password)
   */
  async register(data: any) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        provider: 'LOCAL',
        role: 'USER',
      },
    });

    return newUser;
  }

  /**
   * Handle Local Login
   */
  async login(data: any) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      throw new AppError('Incorrect email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Incorrect email or password', 401);
    }

    return user;
  }

  /**
   * Generate JWT Token
   */
  generateToken(userId: number, role: string) {
    // using 'as any' to bypass strict Zod/JWT type conflict
    return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any, 
    });
  }
}

export const authService = new AuthService();