import { Router } from "express";
import categoryController from "../controllers/category.controller.js";
const routes = Router();

routes.get("/", categoryController.getCategories);
routes.post("/createCategory", categoryController.createCategory);
routes.put("/updateCategory/:id", categoryController.updateCategory);
routes.delete("/deleteCate/:id", categoryController.deleteCate);


export default routes;
