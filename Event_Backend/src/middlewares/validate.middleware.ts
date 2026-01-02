import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';
export const validate = (schema: ZodObject<any>) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Check the data
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // 2. If good, go to Controller
      return next(); 
    } catch (error) {
      // 3. If bad, THROW it to the Global Error Handler
      next(error); 
    }
  };