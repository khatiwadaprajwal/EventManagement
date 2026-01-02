// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import  * as authService  from '../services/auth.service';
import { AuthProvider } from '@prisma/client';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.handleSocialLogin({
          email: profile.emails?.[0].value as string,
          name: profile.displayName,
          provider: 'GOOGLE', // Matches AuthProvider enum
          providerId: profile.id,
          avatar: profile.photos?.[0].value,
        });
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;