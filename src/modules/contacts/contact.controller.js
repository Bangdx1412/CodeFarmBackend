import Contact from "./contact.model.js";
import { CONTACT_MESSAGES } from "../../constants/message.js";

// Thêm liên hệ mới
export const addContact = async (req, res) => {
  try {
    const { name, email, phone, note } = req.body;
    const contact = await Contact.create({ name, email, phone, note });
    res.status(201).json({ message: CONTACT_MESSAGES.CREATE_SUCCESS, data: contact });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy danh sách liên hệ
export const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Tạo điều kiện tìm kiếm theo tên, email hoặc phone
    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contacts, total] = await Promise.all([
      Contact.find(query).skip(skip).limit(parseInt(limit)),
      Contact.countDocuments(query)
    ]);

    res.json({
      message: CONTACT_MESSAGES.GET_LIST_SUCCESS,
      data: contacts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: CONTACT_MESSAGES.SERVER_ERROR });
  }
};

// Xóa liên hệ theo id
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: CONTACT_MESSAGES.NOT_FOUND });
    res.json({ message: CONTACT_MESSAGES.DELETE_SUCCESS });
  } catch (err) {
    res.status(500).json({ error: CONTACT_MESSAGES.SERVER_ERROR });
  }
};