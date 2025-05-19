import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({
  user_id: String,
  products: [
    {
      product_id: String,
      title: String,
      thumbnail: String,
      quantity: Number,
      price: Number,
      discountPercentage: Number,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true, versionKey: false });

const Cart = mongoose.model("Cart", cartSchema, "carts");
export default Cart;