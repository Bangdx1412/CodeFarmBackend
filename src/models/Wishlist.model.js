import mongoose from "mongoose";
const wishlistSchema = new mongoose.Schema({
  user_id: String,
  product_id: String,
  addedAt: Date,
}, { versionKey: false });

const Wishlist = mongoose.model("Wishlist", wishlistSchema, "wishlists");
export default Wishlist;
