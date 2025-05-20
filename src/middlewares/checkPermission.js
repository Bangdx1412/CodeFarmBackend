import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/enviroments.js";

const checkPermission = {
  isAdmin: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({
          status: false,
          message: "Không tìm thấy token",
          statusCode: 401
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.admin) {
        req.user = decoded;
        return next();
      }

      return res.status(403).json({
        status: false,
        message: "Không có quyền truy cập",
        statusCode: 403
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: false,
          message: "Token đã hết hạn",
          statusCode: 401
        });
      }
      return res.status(401).json({
        status: false,
        message: "Token không hợp lệ",
        statusCode: 401
      });
    }
  },

  verifyToken: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({
          status: false,
          message: "Không tìm thấy token",
          statusCode: 401
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: false,
          message: "Token đã hết hạn",
          statusCode: 401
        });
      }
      return res.status(401).json({
        status: false,
        message: "Token không hợp lệ",
        statusCode: 401
      });
    }
  }
};

export default checkPermission; 