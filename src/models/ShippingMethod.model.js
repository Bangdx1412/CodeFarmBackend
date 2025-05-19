
import mongoose from "mongoose";
const shippingMethodSchema = new mongoose.Schema({
  name: String,
  carrier: String,
  fee: Number,
  estimated_days: Number,
  status: String,
}, { timestamps: true, versionKey: false });

const ShippingMethod = mongoose.model("ShippingMethod", shippingMethodSchema, "shipping_methods");
export default ShippingMethod;