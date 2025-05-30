import express from "express";
import { addContact, getContacts, deleteContact } from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/", addContact);         // Thêm liên hệ
router.get("/", getContacts);         // Lấy danh sách liên hệ
router.delete("/:id", deleteContact); // Xóa liên hệ theo id

export default router;