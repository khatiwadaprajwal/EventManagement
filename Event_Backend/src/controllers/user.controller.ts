import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { uploadToCloudinary } from '../utils/cloudinary';
import { User as PrismaUser } from '@prisma/client';

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as PrismaUser;
  const profile = await userService.getMe(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    data: { user: profile },
  });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as PrismaUser;
  const { name } = req.body;
  let avatarUrl;

  // Handle Avatar Upload
  if (req.file) {
    const upload = await uploadToCloudinary(req.file.buffer, 'ticket-hive/avatars');
    avatarUrl = upload.url;
  }

  const updatedUser = await userService.updateMe(user.id, {
    name,
    avatar: avatarUrl
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser },
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as PrismaUser;
  await userService.changePassword(user.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully. Please login with your new password.',
  });
});