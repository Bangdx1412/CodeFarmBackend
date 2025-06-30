import ProductReview from './product-review.model.js';
import Order from '../orders/order.model.js';

export const addReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, productId, rating, comment } = req.body;
    if (!orderId || !productId || !rating) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }
    // Kiểm tra đơn hàng đã giao và thuộc về user
    const order = await Order.findOne({ _id: orderId, user_id: userId, status: 'delivered' });
    if (!order) {
      return res.status(400).json({ success: false, message: 'Chỉ được đánh giá sản phẩm khi đơn hàng đã giao' });
    }
    // Kiểm tra sản phẩm có trong đơn hàng không
    const hasProduct = order.orderItems.some(item => item.productId.toString() === productId);
    if (!hasProduct) {
      return res.status(400).json({ success: false, message: 'Sản phẩm không thuộc đơn hàng này' });
    }
    // Kiểm tra đã đánh giá chưa
    const existed = await ProductReview.findOne({ user_id: userId, product_id: productId });
    if (existed) {
      return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }
    // Tạo review
    const review = new ProductReview({ user_id: userId, product_id: productId, rating, comment });
    await review.save();
    return res.json({ success: true, message: 'Đánh giá thành công', data: review });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}; 