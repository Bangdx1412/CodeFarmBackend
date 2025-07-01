import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount_percent: {
    type: Number,
    required: true,
    min: 1,
    max:100
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value >= this.start_date;
      },
      message: "Ngày kết thúc phải sau ngày bắt đầu"
    }
  },
  is_unlimited: {
    type: Boolean,
    default: false // false = có giới hạn
  },
  max_uses: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

const Coupon = mongoose.model("Coupon", couponSchema, "coupons");
export default Coupon;
