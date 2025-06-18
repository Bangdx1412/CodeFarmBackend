import mongoose from "mongoose";
const orderStatusHistorySchema = new mongoose.Schema({
  order_id: String,
  status: String,
  comment: String,
  changed_at: Date,
  changed_by: String,
}, { versionKey: false });

const OrderStatusHistory = mongoose.model("OrderStatusHistory", orderStatusHistorySchema, "order_status_histories");
export default OrderStatusHistory;