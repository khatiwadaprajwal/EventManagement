import { Router } from 'express';
import * as passwordController from '../controllers/password.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { 
  setupSecurityQuestionsSchema, 
  getSecurityQuestionsSchema, 
  resetPasswordSchema, 
  changePasswordSchema
} from '../validators/auth.schema';
import { passwordLimiter } from '../config/limiter';
const router = Router();

// Protected: User must be logged in to SET up questions
router.post(
  '/setup',passwordLimiter, 
  protect, 
  validate(setupSecurityQuestionsSchema), 
  passwordController.setupSecurityQuestions
);

// Public: Forgot Password Flow
router.post(
  '/forgot',passwordLimiter, 
  validate(getSecurityQuestionsSchema), 
  passwordController.getSecurityQuestions
);

router.post(
  '/reset',passwordLimiter, 
  validate(resetPasswordSchema), 
  passwordController.resetPassword
);

export default router;