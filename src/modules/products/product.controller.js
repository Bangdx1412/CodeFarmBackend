import Product from "./product.model.js";
import Category from "../categories/category.model.js";
import { sendSuccess, sendError } from "../../middlewares/success.middleware.js";
import { PRODUCT_MESSAGES } from "../../constants/message.js";
import cloudinary from "../../configs/cloudinary.js";
import searchHelper from "../../helpers/search.js";
import handlePagination from "../../helpers/pagination.js";

export const getProducts = async (req, res, next) => {
  try {
    const searchObject = searchHelper(req.query);
    const pagination = handlePagination(req.query);

    let query = { deleted: false };

    // Xử lý lọc theo danh mục
    if (req.query.category) {
      if (req.query.category === "khac") {
        query.$or = [
          { product_category_id: null },
          { product_category_id: { $exists: false } },
        ];
      } else {
        const categoryExists = await Category.findById(req.query.category);
        if (!categoryExists) {
          return sendError(res, "Không tìm thấy danh mục", 404);
        }
        query.product_category_id = req.query.category;
      }
    }

    // Xử lý tìm kiếm theo keyword
    if (searchObject.regex) {
      query.title = searchObject.regex;
    }

    // Xử lý tìm kiếm theo size
    if (searchObject.size) {
      query["variants.size"] = searchObject.size;
    }

    // Xử lý tìm kiếm theo khoảng giá
    if (
      searchObject.priceRange.min !== null ||
      searchObject.priceRange.max !== null
    ) {
      query.price = {};
      if (searchObject.priceRange.min !== null) {
        query.price.$gte = searchObject.priceRange.min;
      }
      if (searchObject.priceRange.max !== null) {
        query.price.$lte = searchObject.priceRange.max;
      }
    }

    // Tìm tất cả sản phẩm
    const products = await Product.find(query)
      .populate(
        "product_category_id",
        "title parent_id description thumbnails status position slug"
      )
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort({ [searchObject.sort.field]: searchObject.sort.order });

    // Đếm tổng số sản phẩm
    const total = await Product.countDocuments(query);

    return sendSuccess(
      res,
      {
        products,
        pagination: {
          total,
          page: pagination.currentPage,
          limit: pagination.limit,
          totalPages: Math.ceil(total / pagination.limit),
        },
      },
      "Lấy danh sách sản phẩm thành công"
    );
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết sản phẩm
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate(
      "product_category_id",
      "title parent_id description thumbnails status position slug"
    );

    if (!product) {
      return sendError(res, "Không tìm thấy sản phẩm", 404);
    }

    // Lấy các sản phẩm liên quan (cùng danh mục)
    let relatedProducts = [];
    if (product.product_category_id) {
      relatedProducts = await Product.find({
        _id: { $ne: id }, // Loại bỏ sản phẩm hiện tại
        product_category_id: product.product_category_id,
        deleted: false,
      })
        .populate(
          "product_category_id",
          "title parent_id description thumbnails status position slug"
        )
        .limit(4) // Giới hạn 4 sản phẩm liên quan
        .sort({ createdAt: -1 });
    }

    return sendSuccess(
      res,
      {
        product,
        relatedProducts,
      },
      "Lấy chi tiết sản phẩm thành công"
    );
  } catch (error) {
    next(error);
  }
};

// Thêm sản phẩm mới
export const createProduct = async (req, res, next) => {
  try {
    const { title, product_category_id, variants, position } = req.body;

    // Check if category exists if provided
    if (product_category_id) {
      const category = await Category.findOne({
        _id: product_category_id,
        deleted: false,
      });

      if (!category) {
        const error = new Error(PRODUCT_MESSAGES.CATEGORY_NOT_FOUND);
        error.statusCode = 400;
        throw error;
      }
    }

    // Calculate total stock from variants if provided
    let totalStock = 0;
    if (variants && Array.isArray(variants)) {
      totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    }

    // Handle position
    let finalPosition = position;
    if (!finalPosition) {
      const count = await Product.countDocuments();
      finalPosition = count + 1;
    }

    // Create product with optional fields
    const productData = {
      ...req.body,
      stock: totalStock,
      position: finalPosition,
      status: req.body.status || "active",
    };

    // Remove variants if not provided
    if (!variants) {
      delete productData.variants;
    }

    const product = await Product.create(productData);

    // Populate category information if exists
    const populatedProduct = await Product.findById(product._id).populate({
      path: "product_category_id",
      select: "title parent_id",
      populate: {
        path: "parent_id",
        select: "title",
      },
    });

    sendSuccess(res, populatedProduct, PRODUCT_MESSAGES.CREATE_SUCCESS, 201);
  } catch (error) {
    if (error.code === 11000) {
      error.message = PRODUCT_MESSAGES.DUPLICATE_KEY;
      error.statusCode = 400;
    }
    next(error);
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res, next) => {
  try {
    const { variants, product_category_id } = req.body;
    const { id: productId } = req.params;

    const product = await Product.findOne({ _id: productId, deleted: false });
    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    // If category is being updated
    if (product_category_id) {
      const category = await Category.findOne({
        _id: product_category_id,
        deleted: false,
      });

      if (!category) {
        const error = new Error(PRODUCT_MESSAGES.CATEGORY_NOT_FOUND);
        error.statusCode = 400;
        throw error;
      }
    }

    // If variants are being updated
    if (variants && Array.isArray(variants)) {
      req.body.stock = variants.reduce(
        (sum, variant) => sum + variant.stock,
        0
      );
    }

    // Handle thumbnails update
    if (req.files && req.files.length > 0) {
      // Nếu có ảnh mới được upload, xóa tất cả ảnh cũ
      if (product.thumbnails && product.thumbnails.length > 0) {
        const deletePromises = product.thumbnails.map((thumbnail) => {
          const publicId = thumbnail.url.split("/").pop().split(".")[0];
          return cloudinary.uploader.destroy(publicId);
        });
        await Promise.all(deletePromises);
      }
    } else {
      // Nếu không có ảnh mới, giữ nguyên ảnh cũ
      delete req.body.thumbnails;
    }

    // Update product
    const updated = await Product.findOneAndUpdate(
      { _id: productId, deleted: false },
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: "product_category_id",
      select: "title parent_id",
      populate: {
        path: "parent_id",
        select: "title",
      },
    });

    sendSuccess(res, updated, PRODUCT_MESSAGES.UPDATE_SUCCESS);
  } catch (error) {
    if (error.code === 11000) {
      error.message = PRODUCT_MESSAGES.DUPLICATE_KEY;
      error.statusCode = 400;
    }
    next(error);
  }
};

// Xóa mềm sản phẩm
export const softDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      deleted: false,
    });

    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    // Cập nhật trạng thái xóa mềm
    product.deleted = true;
    product.deletedAt = new Date();
    await product.save();

    // Populate thông tin danh mục khi trả về
    const populatedProduct = await Product.findById(product._id).populate({
      path: "product_category_id",
      select: "title parent_id",
      populate: {
        path: "parent_id",
        select: "title",
      },
    });

    sendSuccess(res, populatedProduct, PRODUCT_MESSAGES.SOFT_DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Xóa cứng sản phẩm
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    // Xóa tất cả ảnh từ Cloudinary nếu có
    if (product.thumbnails && product.thumbnails.length > 0) {
      const deletePromises = product.thumbnails.map((thumbnail) => {
        const publicId = thumbnail.url.split("/").pop().split(".")[0];
        return cloudinary.uploader.destroy(publicId);
      });
      await Promise.all(deletePromises);
    }

    // Xóa sản phẩm khỏi database
    await Product.findByIdAndDelete(req.params.id);

    sendSuccess(res, null, PRODUCT_MESSAGES.DELETE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Khôi phục sản phẩm đã xóa mềm
export const restoreProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      deleted: true,
    });

    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    // Khôi phục sản phẩm
    product.deleted = false;
    product.deletedAt = null;
    await product.save();

    // Populate thông tin danh mục khi trả về
    const populatedProduct = await Product.findById(product._id).populate({
      path: "product_category_id",
      select: "title parent_id",
      populate: {
        path: "parent_id",
        select: "title",
      },
    });

    sendSuccess(res, populatedProduct, PRODUCT_MESSAGES.RESTORE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách sản phẩm đã xóa mềm
export const getDeletedProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Tìm tất cả sản phẩm đã xóa mềm
    const deletedProducts = await Product.find({ deleted: true })
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "product_category_id",
        select: "title parent_id",
        populate: {
          path: "parent_id",
          select: "title",
        },
      });

    // Đếm tổng số sản phẩm đã xóa mềm
    const total = await Product.countDocuments({ deleted: true });

    sendSuccess(
      res,
      {
        products: deletedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      },
      "Lấy danh sách sản phẩm đã xóa thành công"
    );
  } catch (error) {
    next(error);
  }
};

// Thêm biến thể cho sản phẩm
export const addProductVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { variants } = req.body;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(id);
    if (!product) {
      return sendError(res, "Không tìm thấy sản phẩm", 404);
    }

    // Kiểm tra sản phẩm đã bị xóa mềm
    if (product.deleted) {
      return sendError(res, "Sản phẩm đã bị xóa", 400);
    }

    // Kiểm tra danh mục tồn tại và chưa bị xóa mềm
    if (product.product_category_id) {
      const category = await Category.findById(product.product_category_id);
      if (!category || category.deleted) {
        return sendError(res, "Danh mục không tồn tại hoặc đã bị xóa", 400);
      }
    }

    // Xử lý thêm biến thể mới
    for (const newVariant of variants) {
      // Tìm biến thể có cùng size
      const existingVariantIndex = product.variants.findIndex(
        (v) => v.size === newVariant.size
      );

      if (existingVariantIndex !== -1) {
        // Nếu đã tồn tại, cộng thêm stock
        product.variants[existingVariantIndex].stock += newVariant.stock;
      } else {
        // Nếu chưa tồn tại, thêm mới
        product.variants.push(newVariant);
      }
    }

    // Tính toán lại tổng stock
    const totalStock = product.variants.reduce(
      (sum, variant) => sum + variant.stock,
      0
    );
    product.stock = totalStock;

    // Lưu sản phẩm đã cập nhật
    await product.save();

    // Populate thông tin danh mục
    await product.populate(
      "product_category_id",
      "title parent_id description thumbnails status position slug"
    );

    return sendSuccess(res, { product }, "Thêm biến thể sản phẩm thành công");
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách sản phẩm đang hoạt động
export const getActiveProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Tìm tất cả sản phẩm đang hoạt động
    const products = await Product.find({
      deleted: false,
      status: "active",
    })
      .populate(
        "product_category_id",
        "title parent_id description thumbnails status position slug"
      )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Đếm tổng số sản phẩm
    const total = await Product.countDocuments({
      deleted: false,
      status: "active",
    });

    return sendSuccess(
      res,
      {
        products,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      "Lấy danh sách sản phẩm đang hoạt động thành công"
    );
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách sản phẩm theo danh mục
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { deleted: false };

    if (category == "khac") {
      // Tìm sản phẩm không có danh mục hoặc danh mục đã bị xóa
      const products = await Product.find({
        $or: [
          { product_category_id: null },
          { product_category_id: { $exists: false } },
        ],
        deleted: false,
      })
        .populate(
          "product_category_id",
          "title parent_id description thumbnails status position slug"
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments({
        $or: [
          { product_category_id: null },
          { product_category_id: { $exists: false } },
        ],
        deleted: false,
      });

      return sendSuccess(
        res,
        {
          products,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
          },
        },
        "Lấy danh sách sản phẩm không có danh mục thành công"
      );
    } else {
      // Kiểm tra danh mục tồn tại
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return sendError(res, "Không tìm thấy danh mục", 404);
      }

      // Tìm sản phẩm theo danh mục
      query.product_category_id = category;
      const products = await Product.find(query)
        .populate(
          "product_category_id",
          "title parent_id description thumbnails status position slug"
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments(query);

      return sendSuccess(
        res,
        {
          products,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
          },
        },
        "Lấy danh sách sản phẩm theo danh mục thành công"
      );
    }
  } catch (error) {
    next(error);
  }
};
