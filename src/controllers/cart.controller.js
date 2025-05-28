import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";
import { sendSuccess } from "../middlewares/success.middleware.js";
import { CART_MESSAGES } from "../constants/message.js";

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res, next) => {
  try {
    const product_id = req.body.product_id;
    const quantity = parseInt(req.body.quantity);
    const variant_id = req.body.variant_id;
    const user_id = req.user._id;

    if(!product_id || !quantity || !variant_id) {
        return res.status(400).json({
            success: false,
            message: CART_MESSAGES.INVALID_INPUT
        });
    }

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: CART_MESSAGES.QUANTITY_REQUIRED
      });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findOne({ _id: product_id, deleted: false });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: CART_MESSAGES.PRODUCT_NOT_FOUND
      });
    }

    // Kiểm tra xem variant_id có hợp lệ không nếu được cung cấp
    if (variant_id && !product.variants.some(v => v._id.toString() === variant_id)) {
        return res.status(400).json({
            success: false,
            message: CART_MESSAGES.INVALID_VARIANT
        });
    }

    // Kiểm tra stock dựa trên biến thể nếu có
    let availableStock = product.stock;
    let selectedVariant = null;
    if (variant_id) {
        selectedVariant = product.variants.find(v => v._id.toString() === variant_id);
        if (!selectedVariant) {
             return res.status(400).json({
                success: false,
                message: CART_MESSAGES.VARIANT_NOT_FOUND
            });
        }
        availableStock = selectedVariant.stock;
    }

    if (availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: variant_id ? CART_MESSAGES.INSUFFICIENT_VARIANT_STOCK : CART_MESSAGES.INSUFFICIENT_STOCK
      });
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ user_id });
    if (!cart) {
      cart = new Cart({ user_id, products: [] });
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingProduct = cart.products.find(
      item => item.product_id.toString() === product_id &&
              (variant_id ? item.variant_id?.toString() === variant_id : !item.variant_id)
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({
        product_id,
        quantity,
        variant_id: variant_id || undefined,
        addedAt: new Date()
      });
    }

    await cart.save();

    // Populate thông tin sản phẩm và thêm thông tin biến thể
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "products.product_id",
        select: "title price discountPercentage thumbnails variants stock"
      });

    // Thêm thông tin chi tiết biến thể vào phản hồi
    const cartWithVariantDetails = populatedCart.products.map(item => {
        const product = item.product_id;
        let variantDetails = null;

        if (item.variant_id && product && product.variants) {
             variantDetails = product.variants.find(v => v._id.toString() === item.variant_id.toString());
        }

        return {
            ...item.toObject(),
            product_id: product ? product.toObject() : null,
            variantDetails: variantDetails ? variantDetails.toObject() : null
        };
    });

    sendSuccess(res, {
        products: cartWithVariantDetails,
        totalPrice: cartWithVariantDetails.reduce((total, item) => {
            const product = item.product_id;
            const price = product ? (product.price * (1 - (product.discountPercentage || 0) / 100)) : 0;
            return total + (price * item.quantity);
        }, 0)
    }, CART_MESSAGES.ADD_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = async (req, res, next) => {
  try {
    const product_id = req.body.product_id;
    const quantity = parseInt(req.body.quantity);
    const variant_id = req.body.variant_id;
    const user_id = req.user._id;

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: CART_MESSAGES.QUANTITY_REQUIRED
      });
    }

    // Kiểm tra sản phẩm tồn tại và còn hàng
    const product = await Product.findOne({ _id: product_id, deleted: false });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: CART_MESSAGES.PRODUCT_NOT_FOUND
      });
    }

    // Kiểm tra xem variant_id có hợp lệ không nếu được cung cấp
    if (variant_id && !product.variants.some(v => v._id.toString() === variant_id)) {
        return res.status(400).json({
            success: false,
            message: CART_MESSAGES.INVALID_VARIANT
        });
    }

    // Kiểm tra stock dựa trên biến thể nếu có
    let availableStock = product.stock;
    if (variant_id) {
        const selectedVariant = product.variants.find(v => v._id.toString() === variant_id);
         if (!selectedVariant) {
             return res.status(400).json({
                success: false,
                message: CART_MESSAGES.VARIANT_NOT_FOUND
            });
        }
        availableStock = selectedVariant.stock;
    }

    if (availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: variant_id ? CART_MESSAGES.INSUFFICIENT_VARIANT_STOCK : CART_MESSAGES.INSUFFICIENT_STOCK
      });
    }

    // Tìm giỏ hàng
    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: CART_MESSAGES.NOT_FOUND
      });
    }

    // Tìm và cập nhật sản phẩm
    const productIndex = cart.products.findIndex(
      item => item.product_id.toString() === product_id &&
              (variant_id ? item.variant_id?.toString() === variant_id : !item.variant_id)
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: CART_MESSAGES.ITEM_NOT_FOUND
      });
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "products.product_id",
        select: "title price discountPercentage thumbnails variants stock"
      });

    sendSuccess(res, populatedCart, CART_MESSAGES.UPDATE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (req, res, next) => {
  try {
    const { product_id, variant_id } = req.body;
    const user_id = req.user._id;

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: CART_MESSAGES.NOT_FOUND
      });
    }

    const initialLength = cart.products.length;
    cart.products = cart.products.filter(
      item => !(item.product_id.toString() === product_id &&
                (variant_id ? item.variant_id?.toString() === variant_id : !item.variant_id))
    );

    if (cart.products.length === initialLength) {
         return res.status(404).json({
            success: false,
            message: CART_MESSAGES.ITEM_NOT_FOUND_TO_REMOVE
        });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "products.product_id",
        select: "title price discountPercentage thumbnails variants stock"
      });

    sendSuccess(res, populatedCart, CART_MESSAGES.REMOVE_SUCCESS);
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết giỏ hàng
export const getCart = async (req, res, next) => {
  try {
    const user_id = req.user._id;

    const cart = await Cart.findOne({ user_id })
      .populate({
        path: "products.product_id",
        select: "title price discountPercentage thumbnails variants stock"
      });

    if (!cart) {
      return sendSuccess(res, { products: [] }, CART_MESSAGES.EMPTY_CART);
    }

    const cartWithVariantDetails = cart.products.map(item => {
        const product = item.product_id;
        let variantDetails = null;

        if (item.variant_id && product && product.variants) {
             variantDetails = product.variants.find(v => v._id.toString() === item.variant_id.toString());
        }

        return {
            ...item.toObject(),
            product_id: product ? product.toObject() : null,
            variantDetails: variantDetails ? variantDetails.toObject() : null
        };
    });

    const totalPrice = cartWithVariantDetails.reduce((total, item) => {
      const product = item.product_id;
      const price = product ? (product.price * (1 - (product.discountPercentage || 0) / 100)) : 0;
      return total + (price * item.quantity);
    }, 0);

    sendSuccess(res, {
      products: cartWithVariantDetails,
      totalPrice
    }, CART_MESSAGES.GET_SUCCESS);
  } catch (error) {
    next(error);
  }
}; 