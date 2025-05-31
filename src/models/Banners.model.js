import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true }, // Đường dẫn hoặc URL ảnh banner
    link: { type: String, default: "" },     // Link khi click vào banner 
    isActive: { type: Boolean, default: true }, // Banner có đang hiển thị không
    description: { type: String, default: "" }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Banner = mongoose.model("Banner", bannerSchema, "banners");

export default Banner;