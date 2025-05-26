import Wishlist from "../models/Wishlist.model.js";

// Lấy danh sách yêu thích của user
export const getWishlist = async (req, res) => {
  try {
    const { user_id } = req.params;
    const wishlist = await Wishlist.findOne({ user_id });
    res.json(wishlist ? wishlist.products : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Thêm sản phẩm vào wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    let wishlist = await Wishlist.findOne({ user_id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user_id,
        products: [{ product_id, addedAt: new Date() }],
      });
    } else {
      const exists = wishlist.products.find(p => p.product_id === product_id);
      if (exists) return res.status(400).json({ message: "Đã có trong wishlist" });
      wishlist.products.push({ product_id, addedAt: new Date() });
    }

    await wishlist.save();
    res.status(201).json(wishlist.products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa sản phẩm khỏi wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    const wishlist = await Wishlist.findOne({ user_id });
    if (!wishlist) return res.status(404).json({ message: "Không tìm thấy wishlist" });

    wishlist.products = wishlist.products.filter(p => p.product_id !== product_id);
    await wishlist.save();
    res.json({ message: "Đã xóa khỏi wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};