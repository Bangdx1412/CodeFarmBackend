import { Router } from 'express';
import { createVNPayPayment, vnpayCallback } from './payment.controller.js';
import checkPermission from '../../middlewares/checkPermission.js';

const router = Router();

// Tạo QR thanh toán VNPay
router.post('/vnpay/create-qr', checkPermission.verifyToken, createVNPayPayment);
// Callback từ VNPay
router.get('/vnpay/callback', vnpayCallback);

export default router; 