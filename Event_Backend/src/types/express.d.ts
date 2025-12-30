import { UserRole, AuthProvider } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: UserRole;
      provider: AuthProvider;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};