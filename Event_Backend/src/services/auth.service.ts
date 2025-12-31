import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import  prisma from '../config/db';
import { env } from '../config/env';
import { AuthProvider } from '@prisma/client';
import { AppError } from '../utils/AppError';
// Import the utils
import { generateAccessToken, generateRefreshToken } from '../utils/tokenGenerate';

interface SocialProfile {
  email: string;
  name: string;
  provider: AuthProvider;
  providerId: string;
  avatar?: string;
}

export class AuthService {
  
  // --- 1. GOOGLE LOGIC ---
  async handleSocialLogin(profile: SocialProfile) {
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      if (existingUser.provider !== profile.provider) {
        throw new AppError(
          `Account already exists with ${existingUser.provider} provider.`,
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

  // --- 2. REGISTER LOGIC ---
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

    // Generate tokens immediately so user is logged in after signup
    const accessToken = generateAccessToken(newUser.id, newUser.role);
    const refreshToken = generateRefreshToken(newUser.id, newUser.role);

    return { user: newUser, accessToken, refreshToken };
  }

  // --- 3. LOGIN LOGIC ---
  async login(data: any) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      throw new AppError('Incorrect email or password', 401);
    }

    // Lock Check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new AppError(`Account locked. Try again in ${minutesLeft} minute(s)`, 403);
    }

    // Password Check
    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      const newAttempts = (user.loginAttempts || 0) + 1;
      let lockUntil = user.lockUntil;

      if (newAttempts >= 10) {
        lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts, lockUntil: lockUntil }
      });

      if (newAttempts >= 10) throw new AppError('Account locked due to too many failed login attempts.', 403);
      throw new AppError('Incorrect email or password', 401);
    }

    // Success: Reset locks
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockUntil: null }
    });

    // Generate Tokens using UTILS
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    return { user, accessToken, refreshToken };
  }

  // --- 4. REFRESH LOGIC ---
  async refreshAccessToken(oldRefreshToken: string) {
    try {
      const decoded = jwt.verify(oldRefreshToken, env.REFRESH_SECRET) as { id: number; role: string };

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) throw new AppError('User not found', 401);

      // Generate NEW Access Token using UTILS
      const newAccessToken = generateAccessToken(user.id, user.role);

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 403);
    }
  }
}

export const authService = new AuthService();