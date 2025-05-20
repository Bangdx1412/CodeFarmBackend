import { Router } from "express";
import authController from "../controllers/auth.controller.js";
const routes = Router();

routes.post("/register", authController.register);
routes.get("/verify-email/:token", authController.verifyEmail);

export default routes;
