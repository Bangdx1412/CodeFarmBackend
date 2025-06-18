import Category from "../modules/categories/category.model.js";
import { CATEGORY_MESSAGES } from "../constants/message.js";

export const validateCreateCategory = async (req, res, next) => {
  try {
    const { title, parent_id, status, position } = req.body;

    // Kiểm tra tiêu đề
    if (!title || title.trim() === "") {
      return res.status(400).json({
        status: false,
        message: CATEGORY_MESSAGES.TITLE_REQUIRED,
        statusCode: 400
      });
    }

    // Kiểm tra parent_id nếu được cung cấp
    if (parent_id) {
      const parentCategory = await Category.findById(parent_id);
      if (!parentCategory) {
        return res.status(400).json({
          status: false,
          message: CATEGORY_MESSAGES.PARENT_NOT_FOUND,
          statusCode: 400
        });
      }

      if (req.params.id === parent_id) {
        return res.status(400).json({
          status: false,
          message: CATEGORY_MESSAGES.CANNOT_BE_OWN_PARENT,
          statusCode: 400
        });
      }
    }

    // Kiểm tra trạng thái
    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: false,
        message: CATEGORY_MESSAGES.INVALID_STATUS,
        statusCode: 400
      });
    }

    // Kiểm tra vị trí nếu được cung cấp
    if (position && isNaN(position)) {
      return res.status(400).json({
        status: false,
        message: CATEGORY_MESSAGES.INVALID_POSITION,
        statusCode: 400
      });
    }

    // Kiểm tra file ảnh nếu có upload
    if (req.file) {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          status: false,
          message: CATEGORY_MESSAGES.INVALID_IMAGE_TYPE,
          statusCode: 400
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: CATEGORY_MESSAGES.SERVER_ERROR,
      error: error.message,
      statusCode: 500
    });
  }
};

export const validateUpdateCategory = async (req, res, next) => {
  try {
    const { title, parent_id, status, position } = req.body;
    const categoryId = req.params.id;

    // Kiểm tra danh mục tồn tại
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        status: false,
        message: CATEGORY_MESSAGES.NOT_FOUND,
        statusCode: 404
      });
    }

    // Kiểm tra tiêu đề nếu được cung cấp
    if (title !== undefined && title.trim() === "") {
      return res.status(400).json({
        status: false,
        message: CATEGORY_MESSAGES.TITLE_REQUIRED,
        statusCode: 400
      });
    }

    // Kiểm tra parent_id nếu được cung cấp
    if (parent_id) {
      const parentCategory = await Category.findById(parent_id);
      if (!parentCategory) {
        return res.status(400).json({
          status: false,
          message: CATEGORY_MESSAGES.PARENT_NOT_FOUND,
          statusCode: 400
        });
      }

      if (categoryId === parent_id) {
        return res.status(400).json({
          status: false,
          message: CATEGORY_MESSAGES.CANNOT_BE_OWN_PARENT,
          statusCode: 400
        });
      }
    }

    // Kiểm tra trạng thái nếu được cung cấp
    if (status && !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: false,
        message: CATEGORY_MESSAGES.INVALID_STATUS,
        statusCode: 400
      });
    }

    // Kiểm tra vị trí nếu được cung cấp
    if (position && isNaN(position)) {
      return res.status(400).json({
        status: false,
        message: CATEGORY_MESSAGES.INVALID_POSITION,
        statusCode: 400
      });
    }

    // Kiểm tra file ảnh nếu có upload
    if (req.file) {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          status: false,
          message: CATEGORY_MESSAGES.INVALID_IMAGE_TYPE,
          statusCode: 400
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: CATEGORY_MESSAGES.SERVER_ERROR,
      error: error.message,
      statusCode: 500
    });
  }
};
