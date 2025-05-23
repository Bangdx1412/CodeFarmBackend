import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  softDeleteCategory,
  restoreCategory,
} from "../controllers/category.controller.js";

const categoryRouter = Router();

// Lấy tất cả danh mục
categoryRouter.get("/", getCategories);

// Tạo danh mục mới
categoryRouter.post("/", createCategory);

// Lấy danh mục theo id
categoryRouter.get("/:id", getCategoryById);

// Cập nhật danh mục
categoryRouter.patch("/:id", updateCategory);

// Xóa vĩnh viễn danh mục
categoryRouter.delete("/:id", deleteCategory);

// Xóa mềm danh mục
categoryRouter.delete("/soft-delete/:id", softDeleteCategory);

// Khôi phục danh mục
categoryRouter.patch("/restore/:id", restoreCategory);

export default categoryRouter;