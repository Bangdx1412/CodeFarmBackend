import { Router } from "express";
import authController from "./auth.controller.js";
import checkPermission from "../../middlewares/checkPermission.js";
const routes = Router();

routes.post("/register", authController.register);
routes.get("/verify-email/:token", authController.verifyEmail);
routes.post("/resend-verification", authController.resendVerification);

routes.post("/login", authController.login);
routes.post("/refresh-token", checkPermission.verifyToken, authController.refreshToken);

routes.post("/forgot-password", authController.forgotPassword);
routes.post("/reset-password", authController.resetPassword);

routes.post("/logout", checkPermission.verifyToken, authController.logout);
export default routes;
