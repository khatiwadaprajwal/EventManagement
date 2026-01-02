import prisma  from '../config/db';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcryptjs';
// Get Current User Profile
export const getMe = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      provider: true,
      createdAt: true
    }
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

// Update User (Name & Avatar)
export const updateMe = async (userId: number, data: { name?: string; avatar?: string }) => {
  return await prisma.user.update({
    where: { id: userId },
    data: data,
    select: { id: true, name: true, avatar: true }
  });
};

export const changePassword = async (userId: number, data: any) => {
  const { oldPassword, newPassword } = data;

  // 1. Get User with Password
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  // 2. Check if User is OAuth (Google users can't change password)
  if (!user.password || user.provider !== 'LOCAL') {
    throw new AppError('You are logged in via Google/GitHub. You cannot change your password.', 400);
  }

  // 3. Verify Old Password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError('Incorrect old password', 401);
  }

  // 4. Hash New Password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // 5. Update DB
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return { message: "Password updated successfully" };
};