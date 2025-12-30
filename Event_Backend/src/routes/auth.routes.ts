// src/routes/auth.routes.ts
import { Router } from 'express';
import passport from 'passport';
import { authController } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Local Auth
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Google Auth
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res, next) => authController.googleCallback(req, res, next)
);

// Protected Route (Testing)
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});

export default router;