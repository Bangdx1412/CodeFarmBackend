import Category from "../models/Category.model.js";
import { sendSuccess } from "../middlewares/success.middleware.js";
import tree from "../helpers/createTree.js";

// Lấy danh sách danh mục
export const getCategories = async (req, res) => {
  try {
    let find = {
      deleted : false
    }

    const categories = await Category.find(find)
      .select('title parent_id description thumbnails status position slug');

    if (!categories || categories.length === 0) {
      return sendSuccess(
        res,
        { categories: [] },
        "Không có danh mục nào"
      );
    }
    const categoryTree = tree(categories);

    return sendSuccess(
      res,
      { categories: categoryTree },
      "Lấy danh sách danh mục thành công"
    );
    
  } catch (error) {
    console.error("Lỗi lấy danh sách danh mục:", error);
    return res.status(500).json({
      status: false,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// Thêm danh mục mới
export const createCategory = async (req, res) => {
  try {
    if (req.body.position == ""||!req.body.position) {
      // đếm số bản ghi trong bảng category
      const count = await Category.countDocuments();
      req.body.position = count + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }
    const category = new Category(req.body);
    await category.save();

    return sendSuccess(
      res,
      category,
      "Thêm danh mục thành công"
    );
  } catch (error) {
    console.error("Lỗi thêm danh mục:", error);
    return res.status(500).json({
      status: false,
      message: "Lỗi server",
      error: error.message,
      statusCode: 500
    });
  }
};

// Cập nhật danh mục
export const updateCategory = (async (req, res) => {
  const id = req.params.id;
  const { title } = req.body;
  const updated = await Category.findByIdAndUpdate(id, { title }, { new: true });
  if (!updated) throw new Error("Không tìm thấy danh mục");
  sendSuccess(res, updated, "Cập nhật danh mục thành công");
});

// Xóa danh mục
export const deleteCategory = (async (req, res) => {
  const id = req.params.id;
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw new Error("Không tìm thấy danh mục để xóa");
  sendSuccess(res, deleted, "Xóa danh mục thành công");
});
