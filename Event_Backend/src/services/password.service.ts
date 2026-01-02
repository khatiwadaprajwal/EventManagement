import bcrypt from 'bcryptjs';
import  prisma  from '../config/db';
import { AppError } from '../utils/AppError';

// --- 1. SETUP QUESTIONS ---
export const setupSecurityQuestions = async (userId: number, data: any) => {
  const { currentPassword, questions } = data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) throw new AppError('User not found', 404);

  // Verify Password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError('Incorrect password', 401);

  // Hash Answers
  const hashedQuestions = await Promise.all(
    questions.map(async (q: any) => ({
      userId,
      question: q.question,
      answer: await bcrypt.hash(q.answer.trim().toLowerCase(), 12),
    }))
  );

  // Transaction: Delete old questions -> Insert new ones
  await prisma.$transaction([
    prisma.securityQuestion.deleteMany({ where: { userId } }),
    prisma.securityQuestion.createMany({ data: hashedQuestions }),
  ]);

  return { message: 'Security questions updated' };
};

// --- 2. GET QUESTIONS (Step 1) ---
export const getSecurityQuestions = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      securityQuestions: {
        select: { id: true, question: true } // NEVER select 'answer'
      }
    }
  });

  if (!user) throw new AppError('User not found', 404);
  
  if (user.securityQuestions.length === 0) {
    throw new AppError('This account has not set up security questions.', 400);
  }

  return { questions: user.securityQuestions };
};

// --- 3. VERIFY & RESET (Step 2) ---
export const resetPassword = async (data: any) => {
  const { email, answers, newPassword } = data;

  // A. Find User with Answers
  const user = await prisma.user.findUnique({
    where: { email },
    include: { securityQuestions: true }
  });

  if (!user) throw new AppError('User not found', 404);

  // B. Check Lockout
  if (user.lockUntil && user.lockUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
    throw new AppError(`Account locked. Try again in ${minutesLeft} minutes.`, 403);
  }

  // C. Verify Answers
  let allCorrect = true;
  
  // We loop through the DB questions
  for (const dbQ of user.securityQuestions) {
    const submittedAnswer = answers[dbQ.id]; // Match by ID
    
    if (!submittedAnswer) {
      allCorrect = false; 
      break;
    }

    // Compare Hash (Trimmed & Lowercase)
    const isMatch = await bcrypt.compare(submittedAnswer.trim().toLowerCase(), dbQ.answer);
    if (!isMatch) {
      allCorrect = false;
      break;
    }
  }

  // D. Handle Failure (Locking Logic)
  if (!allCorrect) {
    const newAttempts = (user.loginAttempts || 0) + 1;
    let lockUntil = user.lockUntil;

    if (newAttempts >= 5) {
      lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 Min Lock
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: newAttempts, lockUntil }
    });

    throw new AppError('One or more answers are incorrect.', 400);
  }

  // E. Success: Reset Password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { 
      password: hashedPassword,
      loginAttempts: 0,
      lockUntil: null
    }
  });

  return { message: 'Password reset successfully' };
};

