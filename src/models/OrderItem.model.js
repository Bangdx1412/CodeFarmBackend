import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  order_id: String,
  product_id: String,
  quantity: Number,
  price: Number,
  title: String,
  thumbnail: String,
  discountPercentage: Number,
}, { versionKey: false });

const OrderItem = mongoose.model("OrderItem", orderItemSchema, "order_items");
export default OrderItem;