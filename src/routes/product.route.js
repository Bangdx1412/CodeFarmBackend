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

const upload = multer();
const router = express.Router();

router.get("/", validateQuery(productQuerySchema), getProducts);
router.get("/categories", getProductCategories);
router.get("/:id", validateParams(z.object({ id: idSchema })), getProductById);

router.post("/",
  upload.array("thumbnails"),
  uploadMultipleCloud,
  validateRequest(createProductSchema),
  createProduct
);

router.post("/:id/variants",
  validateParams(z.object({ id: idSchema })),
  validateRequest(addVariantsSchema),
  addProductVariant
);

router.put("/:id",
  validateParams(z.object({ id: idSchema })),
  upload.array("thumbnails"),
  uploadMultipleCloud,
  validateRequest(updateProductSchema),
  updateProduct
);

router.delete("/soft-delete/:id",
  validateParams(z.object({ id: idSchema })),
  softDeleteProduct
);

router.delete("/:id",
  validateParams(z.object({ id: idSchema })),
  deleteProduct
);

router.patch("/restore/:id",
  validateParams(z.object({ id: idSchema })),
  restoreProduct
);

export default router;
