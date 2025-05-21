import Category from "../models/Category.model.js";
import { sendSuccess } from "../middlewares/success.middleware.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// Lấy danh sách danh mục
export const getCategories = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  const query = search
    ? { title: { $regex: search, $options: "i" } }
    : {};

  const total = await Category.countDocuments(query);

  const categories = await Category.find(query)
    .sort({ createdAt: -1 }) // Sắp xếp theo DESC 
    .skip((page - 1) * limit)
    .limit(Number(limit));

  sendSuccess(
    res,
    {
      categories,
      total,
      limit: Number(limit),
      currentPage: Number(page),
    },
    "Lấy danh sách danh mục thành công"
  );
});

// Thêm danh mục mới
export const createCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    throw new Error("Tên danh mục không được để trống");
  }
  const category = await Category.create({ title });
  sendSuccess(res, category, "Thêm danh mục thành công");
});

// Cập nhật danh mục
export const updateCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { title } = req.body;
  const updated = await Category.findByIdAndUpdate(id, { title }, { new: true });
  if (!updated) throw new Error("Không tìm thấy danh mục");
  sendSuccess(res, updated, "Cập nhật danh mục thành công");
});

// Xóa danh mục
export const deleteCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw new Error("Không tìm thấy danh mục để xóa");
  sendSuccess(res, deleted, "Xóa danh mục thành công");
});
