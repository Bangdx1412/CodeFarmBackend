import { Router } from "express";
import authRoute  from "../modules/auth/auth.routes.js";
import accountRoute  from "../modules/accounts/account.routes.js";
import categoryRoute  from "../modules/categories/category.routes.js";
import productRoute  from "../modules/products/product.routes.js";
import cartRoute from "../modules/cart/cart.routes.js";
import wishlistRoute from "../modules/wishlists/wishlist.routes.js";
import shippingMethodRoute from "../modules/shipping-method/shipping-method.routes.js";
import orderRoute from "../modules/orders/order.routes.js";
import couponRoute from "../modules/coupons/coupon.routes.js";
import bannerRoute from "../modules/banners/banner.routes.js";
import Contact from "../modules/contacts/contact.routes.js";
import paymentRoute from "../modules/payments/payment.route.js";
import productReviewRoutes from '../modules/product-reviews/product-review.routes.js';
import couponUserRoute from "../modules/coupon-user/coupon-user.routes.js";

const routes = Router();

routes.use("/auth", authRoute)
routes.use("/user", accountRoute)
routes.use("/categories", categoryRoute)
routes.use("/products", productRoute)
routes.use("/cart", cartRoute);
routes.use("/wishlist", wishlistRoute);
routes.use("/shipping-methods", shippingMethodRoute);
routes.use("/orders", orderRoute);
routes.use("/coupon", couponRoute);
routes.use("/banners", bannerRoute);
routes.use("/contact", Contact);
routes.use("/payments", paymentRoute);
routes.use('/product-reviews', productReviewRoutes);
routes.use("/coupon-user", couponUserRoute);

export default routes;
