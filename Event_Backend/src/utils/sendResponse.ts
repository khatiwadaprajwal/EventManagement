import { Response } from 'express';

interface ResponseData<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  token?: string; 
}

export const sendResponse = <T>(res: Response, data: ResponseData<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    token: data.token,
    data: data.data,
  });
};