import { Router } from "express";
import productController from "../controllers/product.controller.js";
const routes = Router();

routes.get("/", productController.getProducts);
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)
// routes.use("/products", hanldeProduct...)

export default routes;
