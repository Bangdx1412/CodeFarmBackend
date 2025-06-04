import Product from "../models/Product.model.js";
import Category from "../models/Category.model.js";
import { sendSuccess } from "../middlewares/success.middleware.js";
import { PRODUCT_MESSAGES } from "../constants/message.js";
import tree from "../helpers/createTree.js";
import cloudinary from "../configs/cloudinary.js";
import searchHelper from "../helpers/search.js";
import handlePagination from "../helpers/pagination.js";


export const getProducts = async (req, res, next) => {
  try {
    let find = {
      deleted: false,
    };

    if (req.query.status) {
      find.status = req.query.status;
    }    // Lọc theo danh mục nếu có
    if (req.query.category) {
      find.product_category_id = req.query.category;
    }

    const objectSearch = searchHelper(req.query);
    if (objectSearch.regex) {
      find.title = objectSearch.regex;
    }

    const totalItems = await Product.countDocuments(find);

    let limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }
    limit = Math.min(limit, 50);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    let page = parseInt(req.query.page);
    if (isNaN(page) || page < 1 || page > totalPages) {
      page = 1; 
    }

    const skip = (page - 1) * limit;

    let sort = {};
    if (req.query.sort) {
      const [sortKey, sortValue] = req.query.sort.split(':');
      if (sortKey && sortValue) {
        sort[sortKey] = sortValue === 'desc' ? -1 : 1;
      }
    } else {
      sort = { position: -1 }; 
    }
    
    const products = await Product.find(find)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate({
        path: "product_category_id",
        select: "title parent_id description thumbnails status position slug",
        populate: {
          path: "parent_id",
          select: "title description thumbnails status position slug"
        }
      });
    const formattedProducts = products.map(product => {
      const category = product.product_category_id;
      const discountedPrice = product.getDiscountedPrice();
      const isDiscounted = discountedPrice < product.price;
      
      return {
        ...product.toObject(),
        currentPrice: discountedPrice,
        isDiscounted,
        discountInfo: isDiscounted ? {
          originalPrice: product.price,
          discountPercentage: product.discountPercentage,
          discountStartDate: product.discountStartDate,
          discountEndDate: product.discountEndDate
        } : null,
        category: {
          id: category?._id,
          name: category?.title,
          parent: category?.parent_id ? {
            id: category.parent_id._id,
            name: category.parent_id.title
          } : null
        }
      };
    });
    return res.status(200).json({
      status: true,
      message: PRODUCT_MESSAGES.GET_LIST_SUCCESS,
      data: formattedProducts,
      pagination: {
        currentPage: page, 
        limit,  
        totalPages, 
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1  
      }
    });

  } catch (error) {
    next(error);
  }
};

// Lấy danh sách danh mục cho sản phẩm
export const getProductCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ deleted: false })
      .select('title parent_id description thumbnails status position slug');

      if (!categories?.length) {
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
      path: "product_category_id",
      select: "title parent_id",
      populate: {
        path: "parent_id",
        select: "title"
      }
    });

    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    // Add discounted price information
    const discountedPrice = product.getDiscountedPrice();
    const isDiscounted = discountedPrice < product.price;
    
    const formattedProduct = {
      ...product.toObject(),
      currentPrice: discountedPrice,
      isDiscounted,
      discountInfo: isDiscounted ? {
        originalPrice: product.price,
        discountPercentage: product.discountPercentage,
        discountStartDate: product.discountStartDate,
        discountEndDate: product.discountEndDate
      } : null
    };

    sendSuccess(res, formattedProduct, PRODUCT_MESSAGES.GET_BY_ID_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Thêm sản phẩm mới
export const createProduct = async (req, res, next) => {
  try {
    const { title, product_category_id, variants, position } = req.body;

    // Check if category exists
    const category = await Category.findOne({
      _id: product_category_id,
      deleted: false
    });

    if (!category) {
      const error = new Error(PRODUCT_MESSAGES.CATEGORY_NOT_FOUND);
      error.statusCode = 400;
      throw error;
    }

    

    // Calculate total stock from variants
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);

    // Handle position
    let finalPosition = position;
    if (!finalPosition) {
      const count = await Product.countDocuments();
      finalPosition = count + 1;
    }

    // Create product with variants
    const product = await Product.create({
      ...req.body,
      stock: totalStock,
      variants: variants,
      position: finalPosition
    });
    
    // Populate category information
    const populatedProduct = await Product.findById(product._id)
      .populate({
        path: "product_category_id",
        select: "title parent_id",
        populate: {
          path: "parent_id",
          select: "title"
        }
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

    // If variants are being updated
    if (variants && Array.isArray(variants)) {
      req.body.stock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    }

    // If category is being updated
    if (product_category_id) {
      const category = await Category.findOne({
        _id: product_category_id,
        deleted: false
      });

      if (!category) {
        const error = new Error(PRODUCT_MESSAGES.CATEGORY_NOT_FOUND);
        error.statusCode = 400;
        throw error;
      }
    }

    // Handle thumbnails update
    if (req.body.thumbnails && Array.isArray(req.body.thumbnails)) {
      // Delete old thumbnails from Cloudinary if they exist
      if (product.thumbnails && product.thumbnails.length > 0) {
        const deletePromises = product.thumbnails.map(thumbnail => {
          const publicId = thumbnail.url.split('/').pop().split('.')[0];
          return cloudinary.uploader.destroy(publicId);
        });
        await Promise.all(deletePromises);
      }
    }

    const updated = await Product.findOneAndUpdate(
      { _id: productId, deleted: false },
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: "product_category_id",
      select: "title parent_id",
      populate: {
        path: "parent_id",
        select: "title"
      }
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
      path: "product_category_id",
      select: "title parent_id",
      populate: {
        path: "parent_id",
        select: "title"
      }
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
      path: "product_category_id",
      select: "title parent_id",
      populate: {
        path: "parent_id",
        select: "title"
      }
    });

    sendSuccess(res, populatedProduct, PRODUCT_MESSAGES.RESTORE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Thêm biến thể cho sản phẩm
export const addProductVariant = async (req, res, next) => {
  try {
    const { variants } = req.body;
    const { id: productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error(PRODUCT_MESSAGES.NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    // Check for duplicate sizes
    const existingSizes = new Set(product.variants.map(v => v.size));
    for (const variant of variants) {
      if (existingSizes.has(variant.size)) {
        const error = new Error(PRODUCT_MESSAGES.VARIANT_SIZE_DUPLICATE);
        error.statusCode = 400;
        throw error;
      }
    }

    // Add new variants
    product.variants.push(...variants);
    
    // Update total stock
    product.stock = product.variants.reduce((total, variant) => total + variant.stock, 0);
    
    await product.save();

    // Populate category information
    const populatedProduct = await Product.findById(product._id)
      .populate({
        path: "product_category_id",
        select: "title parent_id",
        populate: {
          path: "parent_id",
          select: "title"
        }
      });

    sendSuccess(res, populatedProduct, "Thêm biến thể thành công");
  } catch (error) {
    next(error);
  }
};