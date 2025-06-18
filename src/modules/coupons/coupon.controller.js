import Coupon from "./coupon.model.js";
import { COUPON_MESSAGES } from "../../constants/message.js";

// Tạo coupon 
export const createCoupon = async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_purchase, start_date, end_date } = req.body;
    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(400).json({ status: false, message: COUPON_MESSAGES.CODE_EXISTS });
    }
    const coupon = await Coupon.create({
      code,
      discount_type,
      discount_value,
      min_purchase,
      start_date,
      end_date,
    });
    res.status(201).json({ status: true, message: COUPON_MESSAGES.CREATE_SUCCESS, data: coupon });
  } catch (error) {
    res.status(500).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};

// Sửa coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (updateData.code) {
      const exists = await Coupon.findOne({ code: updateData.code, _id: { $ne: id } });
      if (exists) {
        return res.status(400).json({ status: false, message: COUPON_MESSAGES.CODE_EXISTS });
      }
    }
    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true });
    if (!coupon) {
      return res.status(404).json({ status: false, message: COUPON_MESSAGES.NOT_FOUND });
    }
    res.json({ status: true, message: COUPON_MESSAGES.UPDATE_SUCCESS, data: coupon });
  } catch (error) {
    res.status(500).json({ status: false, message: COUPON_MESSAGES.SERVER_ERROR, error: error.message });
  }
};