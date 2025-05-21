import mongoose from "mongoose";
const forgotPasswordSchema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    // xét thời gian hết hạn của otp
    expireAt: {
      type: Date,
      expires: 180,
    },
  },
  {
    timestamps: true,
  }
);
const ForgotPassword = mongoose.model(
  "ForgotPassword",
  forgotPasswordSchema,
  "forgot-password"
);

export default ForgotPassword; 
