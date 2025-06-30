import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  amount: Number,
  payment_method: String,
  status: String,
  transaction_id: String,
  payment_date: Date,
  // Thông tin chi tiết VNPay
  vnp_TxnRef: String,
  vnp_ResponseCode: String,
  vnp_SecureHash: String,
  vnp_TransactionNo: String,
  vnp_OrderInfo: String,
  vnp_OrderType: String,
  vnp_Locale: String,
  vnp_CreateDate: String,
  vnp_ExpireDate: String,
}, { timestamps: true, versionKey: false });

const Payment = mongoose.model("Payment", paymentSchema, "payments");
export default Payment;
