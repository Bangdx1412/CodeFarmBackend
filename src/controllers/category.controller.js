import Category from "../models/Category.model.js";
import Product from "../models/Product.model.js";
import { sendSuccess } from "../middlewares/success.middleware.js";
import tree from "../helpers/createTree.js";
import { CATEGORY_MESSAGES } from "../constants/message.js";
import { v2 as cloudinary } from 'cloudinary';

// Lấy danh sách danh mục (chỉ lấy những danh mục chưa bị xóa)
export const getCategories = async (req, res) => {
  try {
    let find = {
      deleted: false
    }

    const categories = await Category.find(find)

    if (!categories || categories.length === 0) {
      return res.status(200).json({
        status: true,
        message: CATEGORY_MESSAGES.NO_CATEGORIES,
        data: { categories: [] }
      });
    }
    const categoryTree = tree(categories);

    return res.status(200).json({
      status: true,
      message: CATEGORY_MESSAGES.GET_LIST_SUCCESS,
      data: { categories: categoryTree }
    });
    
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: CATEGORY_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Lấy danh sách danh mục active và chưa bị xóa mềm
export const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      deleted: false,
      status: "active"
    }).sort({ position: 1 });

    if (!categories || categories.length === 0) {
      return res.status(200).json({
        status: true,
        message: CATEGORY_MESSAGES.NO_CATEGORIES,
        data: { categories: [] }
      });
    }
    
    const categoryTree = tree(categories);
    
    return res.status(200).json({
      status: true,
      message: CATEGORY_MESSAGES.GET_ACTIVE_SUCCESS,
      data: { 
        categories: categoryTree,
        total: categories.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: CATEGORY_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Thêm danh mục mới
export const createCategory = async (req, res) => {
  try {
    const { title, parent_id, description, status, position } = req.body;

    const categoryData = {
      title,
      parent_id: parent_id || "",
      description: description || "",
      status: status || "active",
      deleted: false,
      thumbnails: req.body.thumbnails || ""
    };

    if (position && !isNaN(position)) {
      categoryData.position = parseInt(position);
    } else {
      const count = await Category.countDocuments();
      categoryData.position = count + 1;
    }

    const category = new Category(categoryData);
    await category.save();

    return res.status(201).json({
      status: true,
      message: CATEGORY_MESSAGES.CREATE_SUCCESS,
      data: category
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: CATEGORY_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, parent_id, description, status, position } = req.body;

    const currentCategory = await Category.findById(id);
    if (!currentCategory) {
      return res.status(404).json({
        status: false,
        message: CATEGORY_MESSAGES.NOT_FOUND
      });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {};

    // Chỉ cập nhật các trường được gửi lên
    if (title !== undefined) updateData.title = title;
    if (parent_id !== undefined) updateData.parent_id = parent_id;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (position !== undefined) updateData.position = parseInt(position);

    // Xử lý ảnh nếu có upload ảnh mới
    if (req.body.thumbnails) {
      // Nếu có ảnh cũ, xóa ảnh cũ trên Cloudinary
      if (currentCategory.thumbnails) {
        const publicId = currentCategory.thumbnails.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
      updateData.thumbnails = req.body.thumbnails;
    }

    // Nếu không có gì thay đổi
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        status: true,
        message: "Không có thay đổi nào được cập nhật",
        data: currentCategory
      });
    }

    // Cập nhật danh mục
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: CATEGORY_MESSAGES.UPDATE_SUCCESS,
      data: updatedCategory
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: CATEGORY_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Lấy danh sách danh mục đã bị xóa mềm
export const getDeletedCategories = async (req, res) => {
  try {
    const categories = await Category.find({ deleted: true });

    if (!categories || categories.length === 0) {
      return res.status(200).json({
        status: true,
        message: CATEGORY_MESSAGES.NO_DELETED_CATEGORIES,
        data: { categories: [] }
      });
    }

    return res.status(200).json({
      status: true,
      message: CATEGORY_MESSAGES.GET_DELETED_SUCCESS,
      data: { categories }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: CATEGORY_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Xóa mềm danh mục
export const softDeleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        status: false,
        message: CATEGORY_MESSAGES.NOT_FOUND
      });
    }

    // Cập nhật trường deleted thành true
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: CATEGORY_MESSAGES.SOFT_DELETE_SUCCESS,
      data: updatedCategory
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: CATEGORY_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Xóa cứng danh mục
export const hardDeleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        status: false,
        message: CATEGORY_MESSAGES.NOT_FOUND
      });
    }

    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    const products = await Product.find({ product_category_id: id });
    if (products.length > 0) {
      // Cập nhật product_category_id của các sản phẩm thành null
      await Product.updateMany(
        { product_category_id: id },
        { product_category_id: null }
      );
    }

    // Xóa ảnh trên Cloudinary nếu có
    if (category.thumbnails) {
      const publicId = category.thumbnails.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Xóa cứng danh mục
    await Category.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: CATEGORY_MESSAGES.HARD_DELETE_SUCCESS,
      data: {
        deletedCategory: category,
        affectedProducts: products.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: CATEGORY_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

// Khôi phục danh mục đã bị xóa mềm
export const restoreCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        status: false,
        message: CATEGORY_MESSAGES.NOT_FOUND
      });
    }

    // Cập nhật trường deleted thành false
    const restoredCategory = await Category.findByIdAndUpdate(
      id,
      { deleted: false },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: CATEGORY_MESSAGES.RESTORE_SUCCESS,
      data: restoredCategory
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: CATEGORY_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
}; 