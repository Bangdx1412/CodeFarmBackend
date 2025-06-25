import Wishlist from "./wishlist.model.js";
import Product from "../products/product.model.js";
// Lấy danh sách yêu thích của user
export const getWishlist = async (req, res) => {
  try {
   const user_id = req.user._id;
    const wishlist = await Wishlist.findOne({ user_id });
    if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
      return res.status(404).json({
        message: "Chưa có sản phẩm nào trong danh sách yêu thích",
      })
    }
    return res.status(200).json({
      status: true,
      data: wishlist.products,
      message: "Danh sách yêu thích đã được lấy thành công",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm sản phẩm vào wishlist
import mongoose from "mongoose";

export const addToWishlist = async (req, res) => {
  try {
    const product_id = req.body.product_id;
    if (!product_id) {
      return res.status(400).json({ message: "Thiếu product_id" });
    }

    if (!mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const user_id = req.user._id;
    let wishlist = await Wishlist.findOne({ user_id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user_id,
        products: [{ product_id, addedAt: new Date() }],
      });
    } else {
      const exists = wishlist.products.find(p => p.product_id.toString() === product_id);
      if (exists) return res.status(400).json({ message: "Đã có trong wishlist" });
      wishlist.products.push({ product_id, addedAt: new Date() });
    }

    await wishlist.save();
  return  res.status(201).json(wishlist.products,);
  } catch (err) {
   return res.status(500).json({ message: err.message });
  }
};

// Xóa sản phẩm khỏi wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const product_id  = req.body.product_id;
    const user_id = req.user._id;
    if (!product_id) {
      return res.status(400).json({ message: "Thiếu product_id" });
    }
    const wishlist = await Wishlist.findOne({ user_id });
    if (!wishlist) return res.status(404).json({ message: "Không tìm thấy wishlist" });

    wishlist.products = wishlist.products.filter(p => p.product_id !== product_id);
    await wishlist.save();
   return res.json({ message: "Đã xóa khỏi wishlist" });
  } catch (err) {
   return res.status(500).json({ message: err.message });
  }
};