import { Router } from "express";
import productRoute  from "./product.route.js";
import categoryRoute  from "./category.route.js";
import authRoute  from "./auth.route.js";
import userRoute  from "./user.route.js";
const routes = Router();

routes.use("/products", productRoute)
routes.use("/categories", categoryRoute)
routes.use("/auth", authRoute)
routes.use("/user", userRoute)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)

export default routes;
