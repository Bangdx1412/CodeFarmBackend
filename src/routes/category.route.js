import express from "express";
import {
  getCategories,
  getDeletedCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
  hardDeleteCategory,
  restoreCategory,
  getActiveCategories,
  getCateById
} from "../controllers/category.controller.js";
import multer from "multer";
import { uploadCloud } from "../middlewares/uploadCloud.js";
import checkPermission from "../middlewares/checkPermission.js";
import { validateCreateCategory, validateUpdateCategory } from "../validations/categories.validation.js";

// Cấu hình multer
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

// Middleware kiểm tra số lượng file
const checkFileCount = (req, res, next) => {
  if (req.files && req.files.length > 1) {
    return res.status(400).json({
      status: false,
      message: 'Chỉ được phép upload 1 ảnh cho danh mục',
      statusCode: 400
    });
  }
  next();
};

const router = express.Router();

// Lấy danh sách danh mục (chưa bị xóa)
router.get("/",
  checkPermission.verifyToken,
  checkPermission.isAdmin ,
  getCategories);

// Tạo danh mục mới
router.post(
  "/",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  upload.single("thumbnails"),
  checkFileCount,
  uploadCloud,
  validateCreateCategory,
  createCategory
);

// Cập nhật danh mục
router.put(
  "/:id",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  upload.single("thumbnails"),
  checkFileCount,
  uploadCloud,
  validateUpdateCategory,
  updateCategory
);

// Xóa mềm danh mục
router.delete(
  "/:id",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  softDeleteCategory
);

// Lấy danh sách danh mục đã bị xóa
router.get("/deleted", 
  checkPermission.verifyToken, 
  checkPermission.isAdmin, 
  getDeletedCategories);
// Xóa cứng danh mục
router.delete(
  "/:id/hard",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  hardDeleteCategory
);

// Khôi phục danh mục đã bị xóa mềm
router.patch(
  "/:id/restore",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  restoreCategory
);

// Lấy danh sách danh mục active và chưa bị xóa mềm (cho frontend)
router.get("/activeCategories", getActiveCategories);

router.get("/:id",getCateById)
export default router;
