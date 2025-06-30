import Banner from "./banner.model.js";
import { BANNER_MESSAGES } from "../../constants/message.js";
import mongoose from "mongoose";

// Thêm banner 
export const addBanner = async (req, res) => {
  try {
    const { title, link, description, isActive } = req.body;// Lấy dữ liệu từ body
    if (!title) return res.status(400).json({ error: BANNER_MESSAGES.TITLE_REQUIRED });
    
    const bannerData = { title, link, description, isActive };
    if (req.body.image) {
      bannerData.image = req.body.image; // URL từ Cloudinary đã được uploadCloud middleware xử lý
    }
    
    const banner = await Banner.create(bannerData);
    res.status(201).json({ message: BANNER_MESSAGES.CREATE_SUCCESS, data: banner });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy danh sách banner (có phân trang & tìm kiếm)
export const getBanners = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = {
      isActive: true,
      title: { $regex: search, $options: "i" }
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy danh sách banner và tổng số lượng cùng lúc
    const [banners, total] = await Promise.all([
      Banner.find(query).skip(skip).limit(parseInt(limit)),
      Banner.countDocuments(query)
    ]);

    res.json({
      message: BANNER_MESSAGES.GET_LIST_SUCCESS,
      data: banners,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: BANNER_MESSAGES.SERVER_ERROR });
  }
};

// Cập nhật banner
export const updateBanner = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };
    if (req.body.image) {
      updateData.image = req.body.image;
    }
    const banner = await Banner.findOne({ _id: id });
    console.log("🚀 ~ updateBanner ~ banner:", banner);

    if (!banner) return res.status(404).json({ error: BANNER_MESSAGES.NOT_FOUND });

    const updated = await Banner.findByIdAndUpdate(id, updateData, { new: true });

    res.json({ message: BANNER_MESSAGES.UPDATE_SUCCESS, data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa vĩnh viễn banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return res.status(404).json({ error: BANNER_MESSAGES.NOT_FOUND });
    res.json({ message: BANNER_MESSAGES.DELETE_SUCCESS, data: banner });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};