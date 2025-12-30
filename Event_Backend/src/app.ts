import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import passport from './config/passport'; // Import the config we made
import authRoutes from './routes/auth.routes';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
const app: Application = express();

// 1. Global Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors());         // Enable Cross-Origin Resource Sharing
app.use(helmet());       // Add Security Headers

// Logger only in development
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(passport.initialize());

// Routes
app.use('/api/v1/auth', authRoutes);

// Error Handler (Must be last)
app.use(globalErrorHandler);
// 2. Health Check Route (To test if server is alive)
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to TicketHive API 🚀',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 3. Routes will go here later...
// app.use('/api/v1', routes);

export default app;