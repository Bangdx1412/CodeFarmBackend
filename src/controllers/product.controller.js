import Product from "../models/Product.model.js";
import { sendSuccess } from "../middlewares/success.middleware.js";
import { PRODUCT_MESSAGES } from "../constants/message.js";

// Lấy danh sách sản phẩm (có tìm kiếm, phân trang, sort)
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";
    const includeDeleted = req.query.includeDeleted === "true";
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const pageNumber = Number.isNaN(page) || page < 1 ? 1 : page;
    const limitNumber = Number.isNaN(limit) || limit < 1 ? 10 : limit;

    // Lọc
    const filter = includeDeleted ? {} : { deleted: false };
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const skip = (pageNumber - 1) * limitNumber;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: "product_category_ids",
        select: "title",
      });

    sendSuccess(
      res,
      {
        products,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
      PRODUCT_MESSAGES.GET_LIST_SUCCESS
    );
  } catch (error) {
    next(error);
  }
};

// Lấy sản phẩm theo id (ẩn sản phẩm đã xóa mềm)
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      deleted: false,
    }).populate({
      path: "product_category_ids",
      select: "title",
    });

    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }
    sendSuccess(res, product, PRODUCT_MESSAGES.GET_BY_ID_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Thêm sản phẩm mới
export const createProduct = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      const error = new Error(PRODUCT_MESSAGES.TITLE_REQUIRED);
      error.statusCode = 400;
      throw error;
    }

    const existed = await Product.findOne({ title });
    if (existed) {
      const error = new Error(PRODUCT_MESSAGES.ALREADY_EXISTS);
      error.statusCode = 400;
      throw error;
    }

    // Tạo sản phẩm
    const product = await Product.create(req.body);

    // Populate tên danh mục 
    const populatedProduct = await Product.findById(product._id).populate({
      path: "product_category_ids",
      select: "title _id",
    });

    sendSuccess(res, populatedProduct, PRODUCT_MESSAGES.CREATE_SUCCESS, 201);
  } catch (error) {
    next(error);
  }
};

// Cập nhật sản phẩm 
export const updateProduct = async (req, res, next) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, deleted: false },
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: "product_category_ids",
      select: "title _id",
    });
    if (!updated) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }
    sendSuccess(res, updated, PRODUCT_MESSAGES.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Xóa mềm sản phẩm
export const softDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }
    if (product.deleted) {
      const error = new Error(PRODUCT_MESSAGES.ALREADY_DELETED);
      error.statusCode = 400;
      throw error;
    }
    product.deleted = true;
    product.deletedAt = new Date();
    await product.save();

    // Populate tên danh mục khi trả về
    const populatedProduct = await Product.findById(product._id).populate({
      path: "product_category_ids",
      select: "title _id",
    });

    sendSuccess(res, populatedProduct, PRODUCT_MESSAGES.SOFT_DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Xóa vĩnh viễn sản phẩm
export const deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }
    sendSuccess(res, null, PRODUCT_MESSAGES.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Khôi phục sản phẩm đã xóa mềm
export const restoreProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }
    if (!product.deleted) {
      const error = new Error(PRODUCT_MESSAGES.NOT_SOFT_DELETED);
      error.statusCode = 400;
      throw error;
    }
    product.deleted = false;
    product.deletedAt = null;
    await product.save();

    // Populate tên danh mục khi trả về
    const populatedProduct = await Product.findById(product._id).populate({
      path: "product_category_ids",
      select: "title _id",
    });

    sendSuccess(res, populatedProduct, PRODUCT_MESSAGES.RESTORE_SUCCESS);
  } catch (error) {
    next(error);
  }
};