import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';
import Cart from '../cart/cart.model.js';
import Order from '../orders/order.model.js';
import Payment from './payment.model.js';

export const createVNPayPayment = async (req, res) => {
  try {
    const { cartId } = req.body;
    if (!cartId) return res.status(400).json({ message: 'cartId is required' });

    const findCart = await Cart.findOne({ _id: cartId });
    if (!findCart) return res.status(404).json({ message: 'Cart not found' });

    // Giả sử cart có trường totalPrice, nếu không có bạn cần tính tổng tiền từ products
    if (!findCart.totalPrice) return res.status(400).json({ message: 'Cart missing totalPrice' });

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
      vnp_Amount: findCart.totalPrice * 100,
      vnp_IpAddr: req.ip,
      vnp_TxnRef: findCart._id,
      vnp_OrderInfo: `${findCart._id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: 'http://localhost:3000/api/payments/vnpay/callback',
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    // Có thể lưu vnp_TxnRef vào đơn hàng ở đây nếu muốn

    return res.status(201).json(vnpayResponse);
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

    // Lưu thông tin giao dịch vào bảng Payment
    await Payment.create({
      order_id: req.query.vnp_TxnRef,
      amount: req.query.vnp_Amount,
      payment_method: 'vnpay',
      status: req.query.vnp_ResponseCode === '00' ? 'paid' : 'failed',
      transaction_id: req.query.vnp_TransactionNo,
      payment_date: new Date(),
      // Có thể bổ sung thêm các trường khác nếu cần
    });

    if (result.code === '00' && req.query.vnp_ResponseCode === '00') {
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