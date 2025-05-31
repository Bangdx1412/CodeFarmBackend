import { Router } from "express";
import productRoute  from "./product.route.js";
import categoryRoute  from "./category.route.js";
import authRoute  from "./auth.route.js";
import wishlistRoute from "./wishlist.route.js";
import userRoute  from "./user.route.js";
import couponRoute from "./coupon.route.js";
import cartRoute from "./cart.route.js";
import Contact from "./contact.route.js";
import bannerRoute from "./banner.route.js";
const routes = Router();

routes.use("/products", productRoute)
routes.use("/categories", categoryRoute)
routes.use("/auth", authRoute)

routes.use("/wishlist", wishlistRoute);
routes.use("/user", userRoute)
routes.use("/coupon", couponRoute);
routes.use("/cart", cartRoute);
routes.use("/contact", Contact);
routes.use("/banners", bannerRoute);
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)

export default routes;
