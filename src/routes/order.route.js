import { Router } from "express";
import { createOrder, getOrders, getOrderById } from "../controllers/order.controller.js";
import checkPermission from "../middlewares/checkPermission.js";

const router = Router();

// Create new order
router.post("/", checkPermission.verifyToken, createOrder);

// Get all orders for a user
router.get("/", checkPermission.verifyToken, getOrders);

// Get order by ID
router.get("/:id", checkPermission.verifyToken, getOrderById);

export default router; 