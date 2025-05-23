import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import multer from "multer";
import { uploadCloud } from "../middlewares/uploadCloud.js";
import checkPermission from "../middlewares/checkPermission.js";
const upload = multer();

const router = express.Router();

router.get("/", getCategories);
router.post("/",
  checkPermission.verifyToken,
  upload.single("thumbnails"),
  uploadCloud, 
  createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
