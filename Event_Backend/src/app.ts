import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'; 
import { env } from './config/env';
import passport from './config/passport';
import routes from './routes/index'; 
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { globalLimiter } from './config/limiter';

const app: Application = express();

// 1. Global Middlewares
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5173",

  env.CLIENT_URL          
];
app.use(cors({
  origin: (origin, callback) => {

    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));         
app.use(helmet());       

// Logger (Dev only)
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Passport Init
app.use(passport.initialize());

// 2. Health Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to TicketHive API 🚀',
    env: env.NODE_ENV,
  });
});

app.use( globalLimiter); 
app.use('/v1', routes); 

// 4. Global Error Handler (Must be last)
app.use(globalErrorHandler);

export default app;