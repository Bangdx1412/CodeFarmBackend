
import mongoose from "mongoose";
const couponUserSchema = new mongoose.Schema({
  coupon_id: String,
  user_id: String,
  used_at: Date,
}, { versionKey: false });

const CouponUser = mongoose.model("CouponUser", couponUserSchema, "coupon_users");
export default CouponUser;