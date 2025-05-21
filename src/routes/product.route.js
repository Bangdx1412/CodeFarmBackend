import express from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct, // xoá mềm
  forceDeleteProduct, // xoá vĩnh viễn (nếu muốn)
  restoreProduct // khôi phục (nếu muốn)
 
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
// router.delete("/:id", deleteProduct);
router.delete("/soft-delete/:id", deleteProduct); // <-- Xoá mềm
router.delete("/force-delete/:id", forceDeleteProduct); // <-- Xoá vĩnh viễn
router.patch("/restore/:id", restoreProduct); // <-- Khôi phục

export default router;