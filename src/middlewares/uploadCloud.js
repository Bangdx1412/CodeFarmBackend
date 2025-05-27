import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadCloud = async (req, res, next) => {
  if (!req.file) return next();
  if (req.file) {
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    try {
      const result = await streamUpload(req);
      req.body[req.file.fieldname] = result.url; // Gán giá trị url vào key đúng tên input
      next();
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed', error });
    }
  } else {
    next();
  }
};

export const uploadMultipleCloud = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const uploadPromises = req.files.map(file => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve({
            url: result.url,
            position: 0, // Default position
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    req.body.thumbnails = results;
    
    next();
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'Multiple upload failed', error });
  }
};
