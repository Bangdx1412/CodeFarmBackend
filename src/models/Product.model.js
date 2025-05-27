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
  discountPercentage: Number,
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
const Product = mongoose.model("Product", productSchema,"products");

export default Product;
