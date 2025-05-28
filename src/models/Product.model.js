import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);
const productSchema = new mongoose.Schema({
  title: String,
  product_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  description: {
    type: String,
    default: ""
  },
  price: Number,
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  discountStartDate: {
    type: Date,
    default: null
  },
  discountEndDate: {
    type: Date,
    default: null
  },
  stock: Number, // tổng số lượng tồn kho (tính tổng từ các biến thể)
  thumbnails: [
    {
      url: String,
      position: Number,
      createdAt: Date,
      updatedAt: Date
    }
  ],
  status: String,
  position: Number,
  slug: {
    type: String,
    slug: "title",
    unique: true,
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,

  // Thêm biến thể theo size
  variants: [
    {
      size: String, // Ví dụ: "S", "M", "L", "XL"
      stock: Number
    }
  ]
}, { timestamps: true, versionKey: false });

// Thêm method để tính giá sau khi giảm
productSchema.methods.getDiscountedPrice = function() {
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

const Product = mongoose.model("Product", productSchema,"products");

export default Product;
