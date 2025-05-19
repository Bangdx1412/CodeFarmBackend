import Account from "../models/Account.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "../configs/enviroments.js"
const authController = {
  register: async (req, res) => {
    try {
      const { fullName, email, password } = req.body;
      // validate data
      if (!fullName || !email || !password) {
        return res
          .status(400)
          .json({ message: "Vui lòng điền đầy đủ thông tin" });
      }
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmail) {
        return res.status(400).json({ message: "Email không hợp lệ" });
      }
      // check account
      const existingAccount = await Account.findOne({ email });
      if (existingAccount) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }
      // ma hoa password
      const hashPassword = await bcrypt.hash(password, 10);

      // Tra ve thong tin account
      const newAccount = await Account.create({
        fullName,
        email,
        password: hashPassword,
      });
      return res.status(201).json({
        message: "Tạo tài khoản thành công",
        id: newAccount._id,
        fullName: newAccount.fullName,
        email: newAccount.email,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // validate data
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Vui lòng điền đầy đủ thông tin" });
      }
      
      
      // check account
      const account = await Account.findOne({ email });
      if (!account) {
        return res.status(400).json({ message: "Email không tồn tại" });
      }
      // so sanh password
        const isPassword = await bcrypt.compare(String(password), account.password);
      if (!isPassword) {
        return res.status(400).json({ message: "Mật khẩu không đúng" });
      }

      // tra ve token
      const token = jwt.sign({ id: account._id }, JWT_SECRET, {
        expiresIn: "1d",
      });
      console.log(token);
      console.log(123);
      
      // Tra ve thong tin account
      return res.status(200).json({
        message: "Đăng nhập thành công",
        _id: account.id,
        fullName: account.fullName,
        email: account.email,
        token:token,
      });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },
};
export default authController;
