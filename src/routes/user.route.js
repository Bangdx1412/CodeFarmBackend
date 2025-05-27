import { Router } from "express";
import multer from "multer";
import userController from "../controllers/user.controller.js";
import { uploadCloud } from "../middlewares/uploadCloud.js";
import checkPermission from "../middlewares/checkPermission.js";

const upload = multer();
const routeUser = Router();

routeUser.get("/profile", 
    checkPermission.verifyToken,
    userController.getProfile
);

routeUser.post("/update-info-user", 
    checkPermission.verifyToken,
    upload.single("avatar"),
    uploadCloud,
    userController.updateUser
);

export default routeUser;
