import Coupon from "./coupon.model.js";
import { COUPON_MESSAGES } from "../../constants/message.js";

// Tạo coupon
export const createCoupon = async (req, res) => {
  try {
    const { code, discount_percent, start_date, end_date, is_unlimited, max_uses } = req.body;

    // Validate độ dài mã
    if (!code || code.length < 6) {
      return res.status(400).json({ status: false, message: "Mã coupon phải có ít nhất 6 ký tự" });
    }

    // Validate phần trăm giảm giá
    if (!discount_percent || discount_percent < 1 || discount_percent > 100) {
      return res.status(400).json({ status: false, message: "Giá trị giảm giá phải từ 1 đến 100%" });
    }

    // Nếu is_unlimited = false thì max_uses phải > 0
    if (is_unlimited === false && (!max_uses || max_uses <= 0)) {
      return res.status(400).json({ status: false, message: "Bạn phải nhập số lượt sử dụng khi không chọn vô hạn" });
    }

    // Kiểm tra code trùng
    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(400).json({ status: false, message: COUPON_MESSAGES.CODE_EXISTS });
    }

    // Tạo coupon
    const coupon = await Coupon.create({
      code,
      discount_percent,
      start_date,
      end_date,
      is_unlimited,
      max_uses: is_unlimited ? 0 : max_uses
    });

    return res.status(201).json({ status: true, message: COUPON_MESSAGES.CREATE_SUCCESS, data: coupon });
  } catch (error) {
    return res.status(500).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

// Cập nhật coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    
    const { code, discount_percent, start_date, end_date, is_unlimited, max_uses } = req.body;

    // Kiểm tra tồn tại
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ status: false, message: COUPON_MESSAGES.NOT_FOUND });
    }

    // Kiểm tra code trùng với coupon khác
    if (code && code !== coupon.code) {
      if (code.length < 6) {
        return res.status(400).json({ status: false, message: "Mã coupon phải có ít nhất 6 ký tự" });
      }
      const existing = await Coupon.findOne({ code, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ status: false, message: COUPON_MESSAGES.CODE_EXISTS });
      }
      coupon.code = code;
    }

    // Validate phần trăm giảm giá
    if (discount_percent !== undefined) {
      if (discount_percent < 1 || discount_percent > 100) {
        return res.status(400).json({ status: false, message: "Giá trị giảm giá phải từ 1 đến 100%" });
      }
      coupon.discount_percent = discount_percent;
    }

    if (start_date) coupon.start_date = start_date;
    if (end_date) coupon.end_date = end_date;

    if (typeof is_unlimited === "boolean") {
      coupon.is_unlimited = is_unlimited;

      if (!is_unlimited) {
        if (!max_uses || max_uses <= 0) {
          return res.status(400).json({ status: false, message: "Vui lòng nhập số lượt sử dụng khi không chọn vô hạn" });
        }
        coupon.max_uses = max_uses;
      } else {
        coupon.max_uses = 0;
      }
    }

    await coupon.save();

    return res.json({ status: true, message: COUPON_MESSAGES.UPDATE_SUCCESS, data: coupon });
  } catch (error) {
    return res.status(500).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

// Xóa coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({ status: false, message: COUPON_MESSAGES.NOT_FOUND });
    }

    return res.json({ status: true, message: "Xóa mã giảm giá thành công", data: coupon });
  } catch (error) {
    return res.status(500).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

// Lấy tất cả coupon
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    return res.status(200).json({
      status: true,
      message: "Lấy danh sách mã giảm giá thành công",
      data: coupons
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: COUPON_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Lấy chi tiết coupon theo id
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy mã giảm giá"
      });
    }
    return res.status(200).json({
      status: true,
      message: "Lấy chi tiết mã giảm giá thành công",
      data: coupon
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: COUPON_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Lấy chi tiết coupon theo code và kiểm tra user đã dùng chưa
export const getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user?._id;
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy mã giảm giá"
      });
    }
    // Kiểm tra trạng thái sử dụng của user
    let is_used = null;
    if (userId) {
      const CouponUser = (await import("../coupon-user/coupon-user.model.js")).default;
      const couponUser = await CouponUser.findOne({ coupon_id: coupon._id, user_id: userId });
      is_used = couponUser ? couponUser.is_used : null;
    }
    return res.status(200).json({
      status: true,
      message: "Lấy chi tiết mã giảm giá thành công",
      data: {
        coupon,
        is_used
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: COUPON_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};
