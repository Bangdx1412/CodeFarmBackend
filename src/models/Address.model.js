import mongoose from "mongoose";
const addressSchema = new mongoose.Schema({
  user_id: String,
  full_name: String,
  phone: String,
  province: String,
  district: String,
  ward: String,
  street_address: String,
  is_default: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, versionKey: false });

const Address = mongoose.model("Address", addressSchema, "addresses");
export default Address;