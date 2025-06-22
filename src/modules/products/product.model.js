import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 255,
    },
    product_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    discountStartDate: {
      type: Date,
      default: null,
    },
    discountEndDate: {
      type: Date,
      default: null,
    },
    stock: {
      type: Number,
      min: 0,
      default: 0,
    },
    thumbnails: [
      {
        url: String,
        position: Number,
        createdAt: Date,
        updatedAt: Date,
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    position: {
      type: Number,
      min: 0,
      default: 0,
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    variants: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },
        size: String,
        stock: {
          type: Number,
          min: 0,
        },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

// Thêm method để tính giá sau khi giảm
productSchema.methods.getDiscountedPrice = function () {
  const now = new Date();
  if (
    this.discountPercentage > 0 &&
    this.discountStartDate &&
    this.discountEndDate &&
    now >= this.discountStartDate &&
    now <= this.discountEndDate
  ) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.price;
};

const Product = mongoose.model("Product", productSchema, "products");

export default Product;
