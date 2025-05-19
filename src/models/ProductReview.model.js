const productReviewSchema = new mongoose.Schema({
  user_id: String,
  product_id: String,
  rating: Number,
  comment: String,
  review_date: Date,
}, { versionKey: false });

const ProductReview = mongoose.model("ProductReview", productReviewSchema, "product_reviews");
export default ProductReview;