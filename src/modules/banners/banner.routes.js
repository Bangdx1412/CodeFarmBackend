import express from "express";
import multer from "multer";
import {
  addBanner,
  getBanners,
  updateBanner,
  softDeleteBanner,
  restoreBanner,
  deleteBanner
} from "./banner.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Thư mục lưu ảnh tạm

router.post("/", upload.single("image"), addBanner);           
router.get("/", getBanners);                                 
router.patch("/:id", upload.single("image"), updateBanner);    
router.patch("/restore/:id", restoreBanner);                   
router.delete("/soft-delete/:id", softDeleteBanner);           
router.delete("/:id", deleteBanner);                                                  

export default router;