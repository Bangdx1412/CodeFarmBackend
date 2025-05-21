import Category from "../models/Category.model.js";
import { sendSuccess } from "../middlewares/success.middleware.js";

// Lấy tất cả danh mục
export const getCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const includeDeleted = req.query.includeDeleted === "true";

    if (page < 1 || limit < 1) {
      const error = new Error("Page và limit phải là số dương");
      error.statusCode = 400;
      throw error;
    }
    if (search.length > 100) {
      const error = new Error("Chuỗi tìm kiếm quá dài");
      error.statusCode = 400;
      throw error;
    }

    //  lọc
    const filter = includeDeleted ? {} : { is_active: true };
    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Category.countDocuments(filter);
    const categories = await Category.find(filter)
      .skip(skip)
      .limit(limit);

    // Trả về dữ liệu với metadata
    sendSuccess(
      res,
      {
        categories,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Lấy danh sách danh mục thành công"
    );
  } catch (error) {
    next(error);
  }
};

// Lấy danh mục theo id
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      const error = new Error("Danh mục không tồn tại");
      error.statusCode = 404;
      throw error;
    }
    sendSuccess(res, category, "Lấy danh mục thành công");
  } catch (error) {
    next(error);
  }
};

// Tạo danh mục mới
export const createCategory = async (req, res, next) => {
  try {
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    sendSuccess(res, savedCategory, "Tạo danh mục thành công", 201);
  } catch (error) {
    next(error);
  }
};

// Cập nhật danh mục theo id
export const updateCategory = async (req, res, next) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCategory) {
      const error = new Error("Danh mục không tồn tại");
      error.statusCode = 404;
      throw error;
    }
    sendSuccess(res, updatedCategory, "Cập nhật danh mục thành công");
  } catch (error) {
    next(error);
  }
};

// Xóa danh mục vĩnh viễn
export const deleteCategory = async (req, res, next) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      const error = new Error("Danh mục không tồn tại");
      error.statusCode = 404;
      throw error;
    }
    sendSuccess(res, null, "Xóa danh mục thành công");
  } catch (error) {
    next(error);
  }
};

// Xóa mềm danh mục (is_active = false)
export const softDeleteCategory = async (req, res, next) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );
    if (!updatedCategory) {
      const error = new Error("Danh mục không tồn tại");
      error.statusCode = 404;
      throw error;
    }
    sendSuccess(res, updatedCategory, "Xóa mềm danh mục thành công");
  } catch (error) {
    next(error);
  }
};

// Khôi phục danh mục
export const restoreCategory = async (req, res, next) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { is_active: true },
      { new: true }
    );
    if (!updatedCategory) {
      const error = new Error("Danh mục không tồn tại");
      error.statusCode = 404;
      throw error;
    }
    sendSuccess(res, updatedCategory, "Khôi phục danh mục thành công");
  } catch (error) {
    next(error);
  }
};