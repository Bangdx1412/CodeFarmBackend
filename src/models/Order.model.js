import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  user_id: String,
  shipping_address: String,
  shipping_method_id: String,
  payment_method: String,
  total_amount: Number,
  shipping_fee: Number,
  tax: Number,
  coupon_code: String,
  discount_amount: Number,
  status: String,
}, { timestamps: true, versionKey: false });

const Order = mongoose.model("Order", orderSchema, "orders");
export default Order;