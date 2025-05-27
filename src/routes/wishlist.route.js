import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";
const router = express.Router();

router.post("/", addToWishlist);
router.get("/:user_id", getWishlist);
router.delete("/", removeFromWishlist);

export default router;