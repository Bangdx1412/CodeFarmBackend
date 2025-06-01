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
  getProductCategories,
} from "../controllers/product.controller.js";
import multer from "multer";
import { uploadCloud, uploadMultipleCloud } from "../middlewares/uploadCloud.js";
import { validateRequest, validateQuery, validateParams } from "../middlewares/validateRequest.js";
import {
  createProductSchema,
  updateProductSchema,
  addVariantsSchema,
  productQuerySchema,
  idSchema
} from "../validations/product.validation.js";
import { z } from "zod";
import checkPermission from "../middlewares/checkPermission.js";

const upload = multer();
const router = express.Router();

// Public routes
router.get("/", validateQuery(productQuerySchema), getProducts);
router.get("/categories", getProductCategories);
router.get("/:id", validateParams(z.object({ id: idSchema })), getProductById);

// Admin only routes
router.post("/",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  upload.array("thumbnails"),
  uploadMultipleCloud,
  validateRequest(createProductSchema),
  createProduct
);

router.post("/:id/variants",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ id: idSchema })),
  validateRequest(addVariantsSchema),
  addProductVariant
);

router.put("/:id",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ id: idSchema })),
  upload.array("thumbnails"),
  uploadMultipleCloud,
  validateRequest(updateProductSchema),
  updateProduct
);

router.delete("/soft-delete/:id",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ id: idSchema })),
  softDeleteProduct
);

router.delete("/:id",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ id: idSchema })),
  deleteProduct
);

router.patch("/restore/:id",
  checkPermission.verifyToken,
  checkPermission.isAdmin,
  validateParams(z.object({ id: idSchema })),
  restoreProduct
);

export default router;
