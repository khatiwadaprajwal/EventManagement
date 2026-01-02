import multer from 'multer';
import { AppError } from '../utils/AppError';

// 1. Storage: Keep in RAM (Buffer)
const storage = multer.memoryStorage();

// 2. Filter: Only accept Images
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only .jpg, .jpeg, .png or .webp', 400), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
});