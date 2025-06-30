import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';
import Cart from '../cart/cart.model.js';
import Order from '../orders/order.model.js';
import Payment from './payment.model.js';
import { VNPAY_RETURN_URL } from '../../configs/enviroments.js';

export const createVNPayPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId is required' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.payment_method !== 'vnpay') return res.status(400).json({ message: 'Order is not set for VNPay payment' });
    if (order.paymentStatus === 'paid') return res.status(400).json({ message: 'Order already paid' });

    const final_price = order.final_price;
    const vnpay = new VNPay({
      tmnCode: '1JW876ZK',
      secureSecret: 'L2G0ZWU5XVI811CQZEII7PKSDOC3CYPS',
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: 'SHA512',
      loggerFn: ignoreLogger,
    });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: final_price,
      vnp_IpAddr: req.ip,
      vnp_TxnRef: order._id.toString(),
      vnp_OrderInfo: `${order._id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: VNPAY_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });
    return res.status(201).json({
      paymentUrl: vnpayResponse,
      orderId: order._id
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const vnpayCallback = async (req, res) => {
  try {
    const vnpay = new VNPay({
      tmnCode: '1JW876ZK',
      secureSecret: 'L2G0ZWU5XVI811CQZEII7PKSDOC3CYPS',
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: 'SHA512',
      loggerFn: ignoreLogger,
    });
    const result = vnpay.verifyReturnUrl(req.query);
    // 1. Kiểm tra order tồn tại
    const order = await Order.findById(req.query.vnp_TxnRef);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // 2. Bảo vệ callback lặp lại
    if (order.paymentStatus === 'paid') {
      return res.json({ success: true, message: 'Đơn hàng đã thanh toán trước đó' });
    }
    // 3. Lưu thông tin giao dịch vào bảng Payment
    await Payment.create({
      order_id: req.query.vnp_TxnRef,
      amount: Number(req.query.vnp_Amount) / 100,
      payment_method: 'vnpay',
      status: req.query.vnp_ResponseCode === '00' && req.query.vnp_TransactionStatus === '00' ? 'paid' : 'failed',
      transaction_id: req.query.vnp_TransactionNo,
      payment_date: new Date(),
      vnp_TxnRef: req.query.vnp_TxnRef,
      vnp_ResponseCode: req.query.vnp_ResponseCode,
      vnp_SecureHash: req.query.vnp_SecureHash,
      vnp_TransactionNo: req.query.vnp_TransactionNo,
      vnp_OrderInfo: req.query.vnp_OrderInfo,
      vnp_OrderType: req.query.vnp_OrderType,
      vnp_Locale: req.query.vnp_Locale,
      vnp_CreateDate: req.query.vnp_CreateDate,
      vnp_ExpireDate: req.query.vnp_ExpireDate
    });
    if (
      result.code === '00' &&
      req.query.vnp_ResponseCode === '00' &&
      req.query.vnp_TransactionStatus === '00'
    ) {
      // Thanh toán thành công
      await Order.findOneAndUpdate(
        { _id: req.query.vnp_TxnRef },
        { paymentStatus: 'paid', paymentTime: new Date() }
      );
      return res.json({ success: true, message: 'Thanh toán thành công' });
    } else {
      // Thanh toán thất bại
      return res.json({ success: false, message: 'Thanh toán thất bại', result });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}; 