import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { changePasswordSchema } from '../validators/auth.schema';
import { validate } from '../middlewares/validate.middleware';
import { authLimiter } from '../config/limiter';
import { updateProfileSchema } from '../validators/user.schema';
const router = Router();


router.use(protect);

router.get('/me', userController.getMe);
router.patch('/me', upload.single('avatar'),validate(updateProfileSchema), userController.updateMe);
router.post('/change-password',authLimiter, validate(changePasswordSchema), userController.changePassword);
export default router;