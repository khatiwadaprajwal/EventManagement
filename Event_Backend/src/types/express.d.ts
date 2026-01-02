import { User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    // This allows req.user to be strictly typed as the Prisma User
    interface User extends PrismaUser {}
    
    interface Request {
      user?: PrismaUser;
    }
  }
}

export {};