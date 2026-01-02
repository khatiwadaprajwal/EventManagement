import cloudinary from '../config/cloudinary';
import streamifier from 'streamifier';

export const uploadToCloudinary = (buffer: Buffer, folder: string = 'ticket-hive/events'): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed'));
        
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    // Pipe the buffer into the upload stream
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};