import { Router } from "express";
import multer from "multer";
import userController from "./account.controller.js";
import { uploadCloud } from "../../middlewares/uploadCloud.js";
import checkPermission from "../../middlewares/checkPermission.js";

const upload = multer();
const routeUser = Router();

routeUser.get("/profile", 
    checkPermission.verifyToken,
    userController.getProfile
);

// Đổi mật khẩu khi đã đăng nhập
routeUser.post("/change-password", 
    checkPermission.verifyToken,
    userController.changePassword
);

routeUser.put("/update-info-user", 
    checkPermission.verifyToken,
    upload.single("avatar"),
    uploadCloud,
    userController.updateUser
);

routeUser.get("/getUsers",
    checkPermission.verifyToken,
    checkPermission.isAdmin,
    userController.getUsers
);

// Xóa mềm tài khoản (chỉ admin mới có quyền)
routeUser.delete("/:id",
    checkPermission.verifyToken,
    checkPermission.isAdmin,
    userController.softDeleteUser
);
// Khôi phục lại tài khoản
routeUser.put("/:id/restore",
    checkPermission.verifyToken,
    checkPermission.isAdmin,
    userController.restoreUser
)
// Khóa tài khoản
routeUser.put("/:id/lock",
    checkPermission.verifyToken,
    checkPermission.isAdmin,
    userController.lockAccount
)
export default routeUser;
