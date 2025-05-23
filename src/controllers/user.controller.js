import Account from "../models/Account.model.js";
import { z } from "zod";

const updateUserSchema = z.object({
  fullName: z.string().min(1, "Tên không được để trống").optional(),
  phone: z.string()
    .regex(/^0\d{9}$/, "Số điện thoại phải bắt đầu bằng số 0 và có 10 chữ số")
    .optional(),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Giới tính phải là male, female hoặc other" })
  }).optional(),
  birthday: z.string()
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime()) && d <= new Date();
    }, { message: "Ngày sinh không hợp lệ hoặc lớn hơn hiện tại" })
    .optional(),
  address: z.string().optional(),
  avatar: z.string().optional()
});

const updateInfoUser = {
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await Account.findOne(
        { _id: userId, deleted: false },
        { password: 0, token: 0 }
      );

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "Không tìm thấy thông tin người dùng",
          statusCode: 404
        });
      }

      return res.status(200).json({
        status: true,
        message: "Lấy thông tin thành công",
        data: user,
        statusCode: 200
      });

    } catch (error) {
      console.error("Lỗi lấy thông tin:", error);
      return res.status(500).json({
        status: false,
        message: "Lỗi server",
        statusCode: 500
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const userId = req.user.id;
      const dataFromClient = req.body;

      const check = updateUserSchema.safeParse(dataFromClient);
      if (!check.success) {
        const errors = check.error.errors.map(err => err.message);
        return res.status(400).json({
          status: false,
          message: "Dữ liệu không hợp lệ",
          errors,
          statusCode: 400
        });
      }

      const updateFields = {};
      for (let key in check.data) {
        if (check.data[key] !== undefined) {
          updateFields[key] = check.data[key];
        }
      }

      // Nếu không có gì để cập nhật thì trả lỗi
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          status: false,
          message: "Không có dữ liệu để cập nhật",
          statusCode: 400
        });
      }

      if (updateFields.birthday) {
        updateFields.birthday = new Date(updateFields.birthday);
      }

      const updatedUser = await Account.findOneAndUpdate(
        { _id: userId, deleted: false },
        updateFields,
        { new: true, select: "-password -token" }
      );

      if (!updatedUser) {
        return res.status(404).json({
          status: false,
          message: "Không tìm thấy người dùng",
          statusCode: 404
        });
      }

      return res.status(200).json({
        status: true,
        message: "Cập nhật thành công",
        data: updatedUser,
        statusCode: 200
      });

    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      return res.status(500).json({
        status: false,
        message: "Lỗi server",
        statusCode: 500
      });
    }
  }
};

export default updateInfoUser;
