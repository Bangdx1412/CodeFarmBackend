import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account"
  },
  products: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number,
      addedAt: {
        type: Date,
        default: Date.now
      },
      variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
      }
    }
  ]
}, { timestamps: true, versionKey: false });

const Cart = mongoose.model("Cart", cartSchema, "carts");
export default Cart;