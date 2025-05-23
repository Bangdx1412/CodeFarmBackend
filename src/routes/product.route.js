import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  deleteProduct,
  restoreProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/soft-delete/:id", softDeleteProduct);
router.delete("/:id", deleteProduct);
router.patch("/restore/:id", restoreProduct);

export default router;
