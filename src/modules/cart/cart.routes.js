import { Router } from "express";
import { addToCart, updateCartItem, removeFromCart,clearCart, getCart } from "./cart.controller.js";
import checkPermission from "../../middlewares/checkPermission.js";

const cartRoute = Router();

// Tất cả các route đều yêu cầu đăng nhập
cartRoute.use(checkPermission.verifyToken);

// Thêm sản phẩm vào giỏ hàng
cartRoute.post("/add", addToCart);

// Cập nhật số lượng sản phẩm trong giỏ
cartRoute.put("/update", updateCartItem);

// Xóa sản phẩm khỏi giỏ hàng
cartRoute.delete("/delete", removeFromCart);

// Xóa giỏ hàng
cartRoute.delete("/clearCart", clearCart);

// Lấy chi tiết giỏ hàng
cartRoute.get("/", getCart);

export default cartRoute; 