import Account from "../models/Account.model.js";
import RefreshToken from "../models/RefreshToken.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../configs/enviroments.js"
import {sendEmail} from "../utils/sendMail.js";

const authController = {
  register: async (req, res) => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({
          status: false,
          message: "Vui lòng điền đầy đủ thông tin",
          statusCode: 400
        });
      }

      const checkEmail = await Account.findOne({ email, deleted: false });
      if (checkEmail) {
        return res.status(400).json({
          status: false,
          message: "Email đã tồn tại trong hệ thống",
          statusCode: 400
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
      
      const newAccount = new Account({
        email,
        password: hashPassword,
        fullName,
        token: verificationToken,
        status: "pending",
        role_id: "user"
      });

      await newAccount.save();

      // Gửi email xác thực
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      const subject = "Xác thực email của bạn";
      const html = `
        <h1>Xin chào ${fullName},</h1>
        <h2>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi</h2>
        <h3>Chỉ còn 1 bước nữa! Vui lòng click vào link sau để xác thực email của bạn:</h3>
        <p>Lưu ý: Link xác thực này sẽ hết hạn sau 15 phút!</p>
        <a href="${verificationLink}">Xác thực email</a>
      `;

      await sendEmail(email, subject, html);

      res.status(201).json({
        status: true,
        message: "Tài khoản được tạo thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
        data: newAccount,
        statusCode: 201
      });

    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Lỗi server",
        statusCode: 500
      });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;

      const decoded = jwt.verify(token, JWT_SECRET);
      const { email } = decoded;

      const account = await Account.findOne({ 
        email, 
        token,
        deleted: false 
      });

      if (!account) {
        return res.status(400).json({
          status: false,
          message: "Token không hợp lệ hoặc đã hết hạn",
          statusCode: 400
        });
      }
      account.status = "active";
      account.token = null;
      await account.save();

      res.status(200).json({
        status: true,
        message: "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.",
        statusCode: 200
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          status: false,
          message: "Link xác thực đã hết hạn. Vui lòng đăng ký lại.",
          statusCode: 400
        });
      }

      return res.status(500).json({
        status: false,
        message: "Lỗi server",
        statusCode: 500
      });
    }
  },

  resendVerification: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: false,
          message: "Vui lòng cung cấp email",
          statusCode: 400
        });
      }

      const account = await Account.findOne({ 
        email, 
        status: "pending",
        deleted: false 
      });

      if (!account) {
        return res.status(400).json({
          status: false,
          message: "Không tìm thấy tài khoản chưa xác thực với email này",
          statusCode: 400
        });
      }

      const newVerificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

      account.token = newVerificationToken;
      await account.save();

      const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${newVerificationToken}`;
      const subject = "Xác thực email của bạn";
      const html = `
        <h1>Xin chào ${account.fullName},</h1>
        <h2>Chúng tôi đã nhận được yêu cầu gửi lại email xác thực</h2>
        <h3>Vui lòng click vào link sau để xác thực email của bạn:</h3>
        <p>Lưu ý: Link xác thực này sẽ hết hạn sau 15 phút!</p>
        <a href="${verificationLink}">Xác thực email</a>
      `;

      await sendEmail(email, subject, html);

      res.status(200).json({
        status: true,
        message: "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.",
        statusCode: 200
      });

    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Lỗi server",
        statusCode: 500
      });
    }
  }
};

export default authController;
