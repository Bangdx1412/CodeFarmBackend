import express from "express";
import { createCoupon, updateCoupon,deleteCoupon, getAllCoupons } from "./coupon.controller.js";
const router = express.Router();

import checkPermission from "../../middlewares/checkPermission.js";
router.get("/", checkPermission.verifyToken,checkPermission.isAdmin,getAllCoupons);
router.post("/", checkPermission.verifyToken,checkPermission.isAdmin,createCoupon);
router.put("/:id", checkPermission.verifyToken,checkPermission.isAdmin,updateCoupon);
router.delete("/:id", checkPermission.verifyToken, checkPermission.isAdmin, deleteCoupon);
export default router;