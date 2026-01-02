import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod'; // Use ZodSchema to be flexible

export const validate = (schema: ZodSchema<any>) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      const parsedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsedData.body;

      
      return next(); 
    } catch (error) {

      next(error); 
    }
  };