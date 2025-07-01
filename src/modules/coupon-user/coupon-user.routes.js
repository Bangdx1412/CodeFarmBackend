import express from "express";
import { addCouponToUser, cleanupExpiredCoupons } from "./coupon-user.controller.js";
import checkPermission from "../../middlewares/checkPermission.js";

const router = express.Router();

// Thêm mã giảm giá cho user
router.post("/add", checkPermission.verifyToken, addCouponToUser);

router.get("/cleanup", checkPermission.verifyToken, checkPermission.isAdmin, cleanupExpiredCoupons);

export default router; 