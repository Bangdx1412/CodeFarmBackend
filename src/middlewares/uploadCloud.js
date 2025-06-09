import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';
dotenv.config();

// Kiểm tra cấu hình Cloudinary
console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "Đã cấu hình" : "Chưa cấu hình",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Đã cấu hình" : "Chưa cấu hình"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadCloud = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "categories",
          resource_type: "auto"
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );

      try {
        const readStream = streamifier.createReadStream(req.file.buffer);
        readStream.pipe(stream);
      } catch (error) {
        reject(error);
      }
    });
  };

  try {
    const result = await streamUpload(req);
    req.body[req.file.fieldname] = result.url;
    next();
  } catch (error) {
    return res.status(500).json({ 
      status: false,
      message: 'Lỗi khi tải ảnh lên', 
      error: error.message 
    });
  }
};

export const uploadMultipleCloud = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const uploadPromises = req.files.map(file => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "categories",
          resource_type: "auto"
        },
        (error, result) => {
          if (result) {
            resolve({
              url: result.url,
              position: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          } else {
            reject(error);
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    req.body.thumbnails = results;
    next();
  } catch (error) {
    return res.status(500).json({ 
      status: false,
      message: 'Lỗi upload ảnh', 
      error: error.message 
    });
  }
};
