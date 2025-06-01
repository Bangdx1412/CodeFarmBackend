import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const orderSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      ward: { type: String, required: true },
      district: { type: String, required: true },
      province: { type: String, required: true },
    },

    shippingMethod: {
      name: { type: String, required: true },
      fee: { type: Number, required: true, min: 0 },
    },

    payment_method: {
      type: String,
      enum: ["cod", "vnpay"],
      required: true,
    },

    orderItems: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productVariantId: {
          type: Types.ObjectId,
          ref: "ProductVariant",
          required: true,
        },
        productName: { type: String, required: true },
        imageUrl: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
      },
    ],

    coupon: {
      code: { type: String },
      discount_amount: { type: Number, min: 0 },
    },

    subtotal: { type: Number, required: true, min: 0 }, // Tổng sản phẩm
    shipping_fee: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    final_price: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    note: { type: String },
    trackingNumber: { type: String },
  },
  { timestamps: true, versionKey: false }
);

const Order = model("Order", orderSchema, "orders");
export default Order;
