import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
  order_id: String,
  amount: Number,
  payment_method: String,
  status: String,
  transaction_id: String,
  payment_date: Date,
}, { timestamps: true, versionKey: false });

const Payment = mongoose.model("Payment", paymentSchema, "payments");
export default Payment;
