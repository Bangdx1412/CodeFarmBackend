import Account from "./account.model.js";
import bcrypt from "bcrypt";
import { updateUserSchema, changePasswordSchema } from "../../validations/user.validation.js";
import { USER_MESSAGES } from "../../constants/message.js";
import RefreshToken from "../auth/refreshToken.model.js";
import mongoose from "mongoose";

const userController = {
  getProfile: async (req, res) => {
    try {
      const userId = req.user._id;
      console.log(userId);
      
      const user = await Account.findOne(
        { _id: userId, deleted: false },
        { password: 0, token: 0 }
      );

      if (!user) {
        return res.status(404).json({
          status: false,
          message: USER_MESSAGES.NOT_FOUND,
          statusCode: 404
        });
      }

      return res.status(200).json({
        status: true,
        message: USER_MESSAGES.GET_PROFILE_SUCCESS,
        data: user,
        statusCode: 200
      });

    } catch (error) {
      console.error("Lỗi lấy thông tin:", error);
      return res.status(500).json({
        status: false,
        message: USER_MESSAGES.SERVER_ERROR,
        statusCode: 500
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const userId = req.user._id;
      const dataFromClient = req.body;

      const check = updateUserSchema.safeParse(dataFromClient);
      if (!check.success) {
        const errors = check.error.errors.map(err => err.message);
        return res.status(400).json({
          status: false,
          message: USER_MESSAGES.INVALID_DATA,
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

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          status: false,
          message: USER_MESSAGES.NO_DATA_TO_UPDATE,
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
          message: USER_MESSAGES.NOT_FOUND,
          statusCode: 404
        });
      }

      return res.status(200).json({
        status: true,
        message: USER_MESSAGES.UPDATE_SUCCESS,
        data: updatedUser,
        statusCode: 200
      });

    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      return res.status(500).json({
        status: false,
        message: USER_MESSAGES.SERVER_ERROR,
        statusCode: 500
      });
    }
  },

  getUsers: async (req, res) => {
    try {
      // ❌ Sai: lọc deleted: false
      // const users = await Account.find({ deleted: false }).select("-password -token");
  
      // ✅ Đúng: lấy tất cả user (kể cả deleted:true)
      const users = await Account.find().select("-password -token");
      
      return res.status(200).json({
        status: true,
        message: USER_MESSAGES.GET_USERS_SUCCESS,
        data: users,
        statusCode: 200
      });
    } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error);
      return res.status(500).json({
        status: false,
        message: USER_MESSAGES.SERVER_ERROR,
        statusCode: 500
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user._id;
      const dataFromClient = req.body;

      // Validate input data
      const check = changePasswordSchema.safeParse(dataFromClient);
      if (!check.success) {
        const errors = check.error.errors.map(err => err.message);
        return res.status(400).json({
          status: false,
          message: USER_MESSAGES.INVALID_DATA,
          errors,
          statusCode: 400
        });
      }

      const { oldPassword, newPassword } = check.data;

      // Find user
      const user = await Account.findOne({ _id: userId, deleted: false });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: USER_MESSAGES.OLD_PASSWORD_INCORRECT,
          statusCode: 400
        });
      }

      // Verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: false,
          message: USER_MESSAGES.OLD_PASSWORD_INCORRECT,
          statusCode: 400
        });
      }

      // Check if new password is same as old password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          status: false,
          message: USER_MESSAGES.NEW_PASSWORD_SAME_AS_OLD,
          statusCode: 400
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      // Delete all refresh tokens for this user
      await RefreshToken.deleteMany({ user_id: userId });

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return res.status(200).json({
        status: true,
        message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS,
        statusCode: 200
      });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      return res.status(500).json({
        status: false,
        message: USER_MESSAGES.SERVER_ERROR,
        statusCode: 500
      });
    }
  },

  softDeleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user._id;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: false, message: USER_MESSAGES.INVALID_ID });
      }
  
      if (id === currentUserId.toString()) {
        return res.status(400).json({ status: false, message: USER_MESSAGES.CANNOT_DELETE_SELF });
      }
  
      const user = await Account.findById(id);
      if (!user) {
        return res.status(404).json({ status: false, message: USER_MESSAGES.NOT_FOUND });
      }
  
      // Chỉ admin được xóa, và không được xóa admin khác
      if (!req.user.admin || user.admin) {
        return res.status(403).json({
          status: false,
          message: "Không có quyền xóa người dùng này"
        });
      }
  
      await Account.findByIdAndUpdate(id, {
        $set: { deleted: true, updatedAt: new Date() }
      });
  
      return res.status(200).json({ status: true, message: USER_MESSAGES.SOFT_DELETE_SUCCESS });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: USER_MESSAGES.SERVER_ERROR });
    }
  },
  lockAccount: async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: false, message: USER_MESSAGES.INVALID_ID });
      }
  
      if (id === currentUserId.toString()) {
        return res.status(400).json({ status: false, message: "Không thể tự khóa tài khoản của mình" });
      }
  
      const user = await Account.findById(id);
      if (!user) {
        return res.status(404).json({ status: false, message: USER_MESSAGES.NOT_FOUND });
      }
  
      // Chỉ admin được khóa, và không được khóa admin khác
      if (!req.user.admin || user.admin) {
        return res.status(403).json({ status: false, message: "Không có quyền khóa tài khoản này" });
      }
  
      await Account.findByIdAndUpdate(id, {
        $set: { deleted: true, status: 'inactive', updatedAt: new Date() }
      });
  
      return res.status(200).json({ status: true, message: "Tài khoản đã bị khóa" });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: "Lỗi máy chủ" });
    }
  },
  
  restoreUser: async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: false, message: USER_MESSAGES.INVALID_ID });
      }
  
      const user = await Account.findById(id);
      if (!user) {
        return res.status(404).json({ status: false, message: USER_MESSAGES.NOT_FOUND });
      }
  
      // Chỉ admin mới có quyền khôi phục
      if (!req.user.admin) {
        return res.status(403).json({ status: false, message: "Không có quyền khôi phục tài khoản" });
      }
  
      await Account.findByIdAndUpdate(id, {
        $set: { deleted: false, status: 'active', updatedAt: new Date() }
      });
  
      return res.status(200).json({ status: true, message: "Khôi phục tài khoản thành công" });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, message: "Lỗi máy chủ" });
    }
  },
};


export default userController;
