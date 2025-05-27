import Account from "../models/Account.model.js";
import RefreshToken from "../models/RefreshToken.model.js";
import ForgotPassword from "../models/ForgotPassword.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../configs/enviroments.js"
import {sendEmail} from "../utils/sendMail.js";


// Hàm tạo OTP ngẫu nhiên
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const authController = {
  // REGISTER
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
        admin: false,
      });

      await newAccount.save();

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
        data: {
          email: newAccount.email,
          fullName: newAccount.fullName,
          status: newAccount.status
        },
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
  // VERIFY EMAIL
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          status: false,
          message: "Token không được cung cấp",
          statusCode: 400
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(400).json({
            status: false,
            message: "Link xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.",
            statusCode: 400
          });
        }
        if (error.name === 'JsonWebTokenError') {
          return res.status(400).json({
            status: false,
            message: "Token không hợp lệ",
            statusCode: 400
          });
        }
        throw error;
      }

      const { email } = decoded;

      const account = await Account.findOne({ 
        email,
        status: "pending",
        deleted: false 
      });

      if (!account) {
        return res.status(400).json({
          status: false,
          message: "Không tìm thấy tài khoản cần xác thực",
          statusCode: 400
        });
      }
      account.status = "active";
      account.token = null;
      account.updatedAt = new Date();
      await account.save();

      res.status(200).json({
        status: true,
        message: "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.",
        statusCode: 200
      });

    } catch (error) {
      console.error('Verify Email Error:', error);
      return res.status(500).json({
        status: false,
        message: "Lỗi server trong quá trình xác thực email",
        statusCode: 500
      });
    }
  },
  // RESEND VERIFICATION
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
  },
  // GENERATE ACCSET TOKEN
  generateAccessToken: (account) => {
    return jwt.sign(
      { 
        id: account._id,
        email: account.email,
        admin: account.admin
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  },
  // GENERATE REFRESH TOKEN
  generateRefreshToken:  (account) => {
    return jwt.sign(
      { 
        id: account._id,
        admin: account.admin    
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
  },
  // LOGIN
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: false,
          message: "Vui lòng điền đầy đủ thông tin",
          statusCode: 400
        });
      }
      const account = await Account.findOne({ 
        email, 
        status: "active",
        deleted: false 
      });

      if (!account) {
        return res.status(400).json({
          status: false,
          message: "Email hoặc mật khẩu không đúng",
          statusCode: 400
        });
      }
      const isPasswordValid = await bcrypt.compare(password, account.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: false,
          message: "Email hoặc mật khẩu không đúng",
          statusCode: 400
        });
      }

      const accessToken = authController.generateAccessToken(account);
      const refreshToken = authController.generateRefreshToken(account);

      try {
        await RefreshToken.deleteMany({ user_id: account._id });
        const refreshTokenDoc = new RefreshToken({
          user_id: account._id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        await refreshTokenDoc.save();

        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 * 1000
        });

        const accountResponse = account.toObject();
        delete accountResponse.password;

        res.status(200).json({
          status: true,
          message: "Đăng nhập thành công",
          data: {
            account: accountResponse,
            accessToken
          },
          statusCode: 200
        });

      } catch (error) {
        console.error('Refresh Token Error:', error);
        return res.status(500).json({
          status: false,
          message: "Lỗi khi xử lý refresh token",
          statusCode: 500
        });
      }

    } catch (error) {
      console.error('Refresh Token Error:', error);
      return res.status(500).json({
        status: false,
        message: "Lỗi server",
        statusCode: 500
      });
    }
  },
  // REFRESH TOKEN
  refreshToken: async (req, res) => {
    try {
      const {refreshToken} = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({
          status: false,
          message: "Không tìm thấy refresh token",
          statusCode: 401
        });
      }

      const tokenDoc = await RefreshToken.findOne({
        token: refreshToken,
        expiresAt: { $gt: new Date() }
      });

      if (!tokenDoc) {
        return res.status(401).json({
          status: false,
          message: "Refresh token không tồn tại hoặc đã hết hạn",
          statusCode: 401
        });
      }

      const account = await Account.findOne({
        _id: tokenDoc.user_id,
        deleted: false
      });

      if (!account) {
        return res.status(401).json({
          status: false,
          message: "Không tìm thấy tài khoản",
          statusCode: 401
        });
      }

      // Verify refresh token
      try {
        jwt.verify(refreshToken, JWT_SECRET);
      } catch (error) {
        //xóa token nếu là lỗi JWT cụ thể
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
          await RefreshToken.deleteOne({ _id: tokenDoc._id });
          res.clearCookie('refreshToken');
          return res.status(401).json({
            status: false,
            message: error.name === 'TokenExpiredError' ? "Refresh token đã hết hạn" : "Refresh token không hợp lệ",
            statusCode: 401
          });
        }
        // Nếu là lỗi khác, không xóa token
        throw error;
      }

      // Tạo access token mới
      const newAccessToken = authController.generateAccessToken(account);

      res.status(200).json({
        status: true,
        message: "Làm mới token thành công",
        data: {
          accessToken: newAccessToken
        },
        statusCode: 200
      });

    } catch (error) {
      console.error('Refresh Token Error:', error);
      return res.status(500).json({
        status: false,
        message: "Lỗi server",
        statusCode: 500
      });
    }
  },
  // FORGOT PASSWORD
  forgotPassword: async (req, res) => {
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
        email: email,
        deleted: false
      });

      if (!account) {
        return res.status(400).json({
          status: false,
          message: "Không tìm thấy tài khoản với email này",
          statusCode: 400
        });
      }

      const otp = generateOTP();
      const expireAt = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

      await ForgotPassword.findOneAndUpdate(
        { email: email },
        { otp, expireAt },
        { upsert: true, new: true }
      );
     
      const subject = 'Đặt lại mật khẩu';
       const html= `
          <h1>Yêu cầu đặt lại mật khẩu</h1>
          <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
          <p>Mã OTP này sẽ hết hạn sau 5 phút.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        `
    

      await sendEmail(email,subject,html );

      res.status(200).json({
        status: true,
        message: "Mã OTP đã được gửi đến email của bạn",
        statusCode: 200
      });

    } catch (error) {
      console.error('Forgot Password Error:', error);
      return res.status(500).json({
        status: false,
        message: "Lỗi server",
        statusCode: 500
      });
    }
  },
  // RESET PASSWORD
  resetPassword: async (req, res) => {
    try {
      const { email, otp, password } = req.body;
      if (!email || !otp || !password) {
        return res.status(400).json({
          status: false,
          message: "Vui lòng cung cấp đầy đủ thông tin",
          statusCode: 400
        });
      }

      const forgotPassword = await ForgotPassword.findOne({
        email: email,
        otp: otp,
        expireAt: { $gt: Date.now() - 5 * 60 * 1000 }
      });

      if (!forgotPassword) {
        return res.status(400).json({
          status: false,
          message: "Mã OTP không hợp lệ hoặc đã hết hạn",
          statusCode: 400
        });
      }

      const account = await Account.findOne({
        email: email,
        deleted: false
      });

      if (!account) {
        return res.status(400).json({
          status: false,
          message: "Không tìm thấy tài khoản",
          statusCode: 400
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);

      account.password = hashPassword;
      await account.save();
      
      await ForgotPassword.deleteOne({ _id: forgotPassword._id });

      res.status(200).json({
        status: true,
        message: "Đặt lại mật khẩu thành công",
        statusCode: 200
      });

    } catch (error) {
      console.error('Reset Password Error:', error);
      return res.status(500).json({
        status: false,
        message: "Lỗi server",
        statusCode: 500
      });
    }
  },
  // LOGOUT
  logout: async(req,res)=>{
    try {
  
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          status: false,
          message: "Không tìm thấy refresh token",
          statusCode: 400
        });
      }

      // Xóa refresh token khỏi database
      await RefreshToken.deleteOne({ token: refreshToken });

      // Xóa refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        status: true,
        message: "Đăng xuất thành công",
        statusCode: 200
      });

    } catch (error) {
      console.error('Logout Error:', error);
      return res.status(500).json({
        status: false,
        message: "Lỗi server",
        statusCode: 500
      });
    }
  }
};

export default authController;
