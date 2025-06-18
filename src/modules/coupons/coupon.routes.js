import express from "express";
import { createCoupon, updateCoupon } from "./coupon.controller.js";
const router = express.Router();

router.post("/", createCoupon);
router.put("/:id", updateCoupon);

export default router;