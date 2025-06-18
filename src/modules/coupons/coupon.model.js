import mongoose from "mongoose";
const couponSchema = new mongoose.Schema({
  code: String,
  discount_type: String,
  discount_value: Number,
  min_purchase: Number,
  start_date: Date,
  end_date: Date,
}, { timestamps: true, versionKey: false });

const Coupon = mongoose.model("Coupon", couponSchema, "coupons");
export default Coupon;
