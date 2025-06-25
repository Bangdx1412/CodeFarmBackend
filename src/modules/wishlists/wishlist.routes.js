import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "./wishlist.controller.js";
import checkPermission from "../../middlewares/checkPermission.js";
const router = express.Router();
router.use(checkPermission.verifyToken);
router.post("/", addToWishlist);
router.get("/", getWishlist);
router.delete("/", removeFromWishlist);

export default router;