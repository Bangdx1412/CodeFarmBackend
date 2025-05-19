import Category from "../models/Category.model.js";

const categoryController = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      if (categories) {
        res.status(200).json(categories);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  createCategory: async (req, res) => {
    try {
      const category = await new Category(req.body);
      category.save();
      res.status(200).json({
        message: "Thêm thành công",
        category: category,
      });
    } catch (error) {}
  },
  updateCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const category = await Category.findOne({ _id: id });
      if (!category) {
        return res.status(404).json({ message: "Không tìm thấy danh mục" });
      }
      if (category) {
        const updateCate = await Category.findByIdAndUpdate(id, req.body, {
          new: true,
        });
        res
          .status(200)
          .json({ message: "Cập nhật thành công", data: updateCate });
      }
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi server" });
    }
  },
  deleteCate: async (req, res) => {
    try {
      const id = req.params.id;
      const cate = await Category.findOne({ _id: id });
      if (!cate) {
        return res.status(404).json({ message: "Không tìm thấy danh mục" });
      }

      const deleteCate = await Category.findByIdAndDelete({ _id: id });
      res.status(200).json({ message: "Xóa thành công", data: deleteCate });
    } catch (error) {
      res.status(500).json({ message: "Đã xảy ra lỗi server" });
    }
  },
};
export default categoryController;
