import { Request, Response } from 'express';
import * as passwordService from '../services/password.service';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { User as PrismaUser } from '@prisma/client';

export const setupSecurityQuestions = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as PrismaUser;
  await passwordService.setupSecurityQuestions(user.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Security questions set successfully.',
  });
});

export const getSecurityQuestions = catchAsync(async (req: Request, res: Response) => {
  const result = await passwordService.getSecurityQuestions(req.body.email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: result,
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await passwordService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password has been reset successfully. You can now login.',
  });
});

