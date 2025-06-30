import express from "express";
import {
  addBanner,
  getBanners,
  updateBanner,
  deleteBanner
} from "./banner.controller.js";
import { validateRequest, validateParams } from "../../middlewares/validateRequest.js";
import { createBannerValidation, updateBannerValidation, bannerIdValidation } from "../../validations/banner.validation.js";

const router = express.Router();
import multer from "multer";
import { uploadBannerCloud } from "../../middlewares/uploadCloud.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Chỉ cho phép upload 1 file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
    }
  }
});

const checkFileCount = (req, res, next) => {
  if (req.file && req.files && req.files.length > 1) {
    return res.status(400).json({
      status: false,
      message: 'Chỉ được phép upload 1 ảnh cho banner',
      statusCode: 400
    });
  }
  next();
};

router.post("/", upload.single("image"), checkFileCount, uploadBannerCloud, validateRequest(createBannerValidation), addBanner);           
router.get("/", getBanners);                                 
router.patch("/:id", validateParams(bannerIdValidation), upload.single("image"), checkFileCount, uploadBannerCloud, validateRequest(updateBannerValidation), updateBanner);          
router.delete("/:id", validateParams(bannerIdValidation), deleteBanner);                                                  

export default router;