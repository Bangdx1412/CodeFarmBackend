import { Router } from "express";
import { createOrder, getOrders, getOrderById, getOrdersAdmin, updateOrderStatus } from "./order.controller.js";
import checkPermission from "../../middlewares/checkPermission.js";

const router = Router();

// Create new order
router.post("/", checkPermission.verifyToken, createOrder);

// Get all orders for a user
router.get("/", checkPermission.verifyToken, getOrders);

// Quản lý đơn hàng - Admin routes
router.get("/get-all-order", checkPermission.verifyToken, checkPermission.isAdmin, getOrdersAdmin);

router.get("/:id", checkPermission.verifyToken, getOrderById);

// Cập nhật trạng thái đơn hàng (admin)
router.put("/:id/status", checkPermission.verifyToken, checkPermission.isAdmin, updateOrderStatus);

export default router; 