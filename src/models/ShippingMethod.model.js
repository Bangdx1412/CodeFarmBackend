import mongoose from "mongoose";

const shippingMethodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    carrier: {
      type: String,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    estimated_days: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const ShippingMethod = mongoose.model("ShippingMethod", shippingMethodSchema, "shipping_methods");
export default ShippingMethod;