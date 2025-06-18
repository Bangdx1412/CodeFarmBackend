import { Router } from "express";
import { createOrder, getOrders, getOrderById, getOrdersAdmin } from "./order.controller.js";
import checkPermission from "../../middlewares/checkPermission.js";

const router = Router();

// Create new order
router.post("/", checkPermission.verifyToken, createOrder);

// Get all orders for a user
router.get("/", checkPermission.verifyToken, getOrders);

// Quản lý đơn hàng - Admin routes
router.get("/get-all-order", checkPermission.verifyToken, checkPermission.isAdmin, getOrdersAdmin);

router.get("/:id", checkPermission.verifyToken, getOrderById);

export default router; 