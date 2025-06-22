import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  deleteProduct,
  restoreProduct,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getProductVariant,
  getDeletedProducts,
  getActiveProducts,
  getProductsByCategory,
} from "./product.controller.js";
import multer from "multer";
import {
  uploadCloud,
  uploadMultipleCloud,
} from "../../middlewares/uploadCloud.js";
import {
  validateRequest,
  validateQuery,
  validateParams,
} from "../../middlewares/validateRequest.js";
import {
  createProductSchema,
  updateProductSchema,
  addVariantsSchema,
  updateVariantSchema,
  deleteVariantSchema,
  idSchema,
  productQuerySchema,
} from "../../validations/product.validation.js";
import { z } from "zod";
import checkPermission from "../../middlewares/checkPermission.js";

const upload = multer();
const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/active", getActiveProducts);
router.get("/category", getProductsByCategory);

router.get(
  "/get-deleted",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateQuery(productQuerySchema),
  getDeletedProducts
);

router.post(
  "/",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  upload.array("thumbnails"),
  uploadMultipleCloud,
  validateRequest(createProductSchema),
  createProduct
);

router.put(
  "/:id",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ id: idSchema })),
  upload.array("thumbnails"),
  uploadMultipleCloud,
  validateRequest(updateProductSchema),
  updateProduct
);

router.delete(
  "/soft-delete/:id",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ id: idSchema })),
  softDeleteProduct
);

router.delete(
  "/:id",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ id: idSchema })),
  deleteProduct
);

router.patch(
  "/restore/:id",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ id: idSchema })),
  restoreProduct
);

router.post(
  "/:id/variants",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ id: idSchema })),
  validateRequest(addVariantsSchema),
  addProductVariant
);

// Cập nhật biến thể sản phẩm
router.put(
  "/:id/variants/:variantIndex",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ 
    id: idSchema,
    variantIndex: z.coerce.number().int().min(0, "Index biến thể không hợp lệ")
  })),
  validateRequest(updateVariantSchema),
  updateProductVariant
);

// Xóa biến thể sản phẩm
router.delete(
  "/:id/variants/:variantIndex",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ 
    id: idSchema,
    variantIndex: z.coerce.number().int().min(0, "Index biến thể không hợp lệ")
  })),
  deleteProductVariant
);

// Lấy thông tin chi tiết của một biến thể
router.get(
  "/:id/variants/:variantIndex",
  validateParams(z.object({ 
    id: idSchema,
    variantIndex: z.coerce.number().int().min(0, "Index biến thể không hợp lệ")
  })),
  getProductVariant
);

// Route lấy sản phẩm theo ID phải đặt sau các route khác
router.get("/:id", validateParams(z.object({ id: idSchema })), getProductById);

export default router;
