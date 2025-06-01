import express from "express";
import {
  getShippingMethods,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
} from "../controllers/shippingMethod.controller.js";
import checkPermission from "../middlewares/checkPermission.js";

const router = express.Router();

// Public routes (but require authentication)
router.get("/", checkPermission.verifyToken, getShippingMethods);
router.get("/:id", checkPermission.verifyToken, getShippingMethodById);

// Admin only routes
router.post("/", checkPermission.verifyToken, checkPermission.isAdmin, createShippingMethod);
router.put("/:id", checkPermission.verifyToken, checkPermission.isAdmin, updateShippingMethod);
router.delete("/:id", checkPermission.verifyToken, checkPermission.isAdmin, deleteShippingMethod);

export default router; 