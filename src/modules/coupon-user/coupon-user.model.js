import mongoose from "mongoose";
const couponUserSchema = new mongoose.Schema({
  coupon_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // hoặc "Account" nếu bạn dùng bảng Account
    required: true
  },
  is_used: {
    type: Boolean,
    default: false
  },
}, { versionKey: false });

const CouponUser = mongoose.model("CouponUser", couponUserSchema, "coupon_users");
export default CouponUser;