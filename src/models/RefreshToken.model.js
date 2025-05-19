import mongoose from "mongoose";
const refreshTokenSchema = new mongoose.Schema({
  user_id: String,
  token: String,
  expiresAt: Date,
}, { timestamps: true, versionKey: false });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema, "refresh_tokens");
export default RefreshToken;