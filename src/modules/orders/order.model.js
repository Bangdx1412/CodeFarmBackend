import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const orderSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "accounts",
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
        productName: { type: String, required: true },
        imageUrl: { type: String },
        variant: {
          size: { type: String, required: true },
        },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },       // Giá gốc
        discountedPrice: { type: Number, required: true, min: 0 }, // Giá đã giảm
      },
    ],

    coupon: {
      code: { type: String },
      discount_amount: { type: Number, min: 0 },
    },

    subtotal: { type: Number, required: true, min: 0 },     // Tổng tiền sản phẩm chưa tính ship/giảm giá
    shipping_fee: { type: Number, required: true, min: 0 }, // Phí vận chuyển
    discount: { type: Number, default: 0, min: 0 },         // Tổng giảm giá
    final_price: { type: Number, required: true, min: 0 },  // Tổng tiền phải trả

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    note: { type: String },
    trackingNumber: { type: String },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentTime: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

const Order = model("Order", orderSchema, "orders");
export default Order;
