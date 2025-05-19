import mongoose from "mongoose";
const accountSchema = new mongoose.Schema(
  {
    fullName: String,
    email:String,
    password: String,
    phone: String,
    avatar:String,
    token: String,
    role_id: String,
    status: String,
    
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    // Thêm createdAt , updatedAt đây là thuộc tính có sẵn của mongoose mục Timestamps
    timestamps: true, versionKey: false
  }
);
const Account = mongoose.model("Account", accountSchema, "accounts");

export default  Account;
