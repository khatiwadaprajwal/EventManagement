import { Router } from 'express';
import passport from 'passport';
import { authController } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// --- Public Routes ---
// using .bind ensure 'this' context works if you use 'this' inside controller
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/refresh', authController.refresh.bind(authController)); // ✅ Added Refresh
router.post('/logout', authController.logout.bind(authController));   // ✅ Added Logout

// --- Google Auth ---
router.get(
  '/google', 
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback.bind(authController)
);

// --- Protected Routes ---
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});

export default router;