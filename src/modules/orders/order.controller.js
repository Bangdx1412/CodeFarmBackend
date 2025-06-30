import Order from "./order.model.js";
import Product from "../products/product.model.js";
import Coupon from "../coupons/coupon.model.js";
import Cart from "../cart/cart.model.js";
import createdHandler from "../../middlewares/createdHandler.js";
import mongoose from "mongoose";
import { validateCreateOrder, validateGetOrderById } from "../../validations/order.validation.js";
import { ORDER_MESSAGES } from "../../constants/message.js";

const ORDER_STATUS_ENUM = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const STATUS_FLOW = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: []
};

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate request body
    const validationResult = validateCreateOrder(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        status: false,
        message: ORDER_MESSAGES.INVALID_DATA,
        errors: validationResult.error.errors,
        statusCode: 400
      });
    }

    const {
      shippingAddress,
      shippingMethod,
      payment_method,
      items,
      couponCode,
      note
    } = req.body;

    // Process each item and calculate totals
    let subtotal = 0;
    const orderItems = [];
    let discount = 0;
    const updatedProducts = []; // Lưu lại các sản phẩm đã cập nhật để rollback nếu cần

    // Process each item
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({
          status: false,
          message: ORDER_MESSAGES.PRODUCT_NOT_FOUND,
          statusCode: 404
        });
      }

      // Find the variant
      const variant = product.variants.find(v => v.size === item.variant.size);
      
      if (!variant) {
        await session.abortTransaction();
        return res.status(400).json({
          status: false,
          message: ORDER_MESSAGES.VARIANT_NOT_FOUND,
          statusCode: 400
        });
      }

      // Check stock
      if (variant.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          status: false,
          message: ORDER_MESSAGES.INSUFFICIENT_STOCK,
          statusCode: 400
        });
      }

      // Calculate prices
      const unitPrice = product.price || 0; // Giá gốc của sản phẩm
      const discountedPrice = product.discountPercentage 
        ? unitPrice * (1 - product.discountPercentage / 100) 
        : unitPrice; // Giá sau khi giảm giá
      const itemTotal = discountedPrice * item.quantity;
      subtotal += itemTotal;

      // Update stock
      variant.stock -= item.quantity;
      product.stock -= item.quantity;
      await product.save({ session });
      updatedProducts.push(product); // Lưu lại sản phẩm đã cập nhật

      // Add to order items
      orderItems.push({
        productId: product._id,
        productName: product.title,
        imageUrl: product.thumbnails?.[0]?.url || null,
        variant: {
          size: item.variant.size
        },
        quantity: item.quantity,
        unitPrice: unitPrice,
        discountedPrice: discountedPrice
      });
    }

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, status: "active" });
      if (!coupon) {
        await session.abortTransaction();
        return res.status(400).json({
          status: false,
          message: ORDER_MESSAGES.COUPON_NOT_FOUND,
          statusCode: 400
        });
      }
      discount = (subtotal * coupon.discount_percent) / 100;
    }

    // Calculate final price
    const shipping_fee = shippingMethod.fee || 0;
    const final_price = subtotal + shipping_fee - discount;

    // Create order
    const order = new Order({
      user_id: req.user._id, // Lấy user_id từ request
      shippingAddress,
      shippingMethod,
      payment_method,
      orderItems,
      coupon: couponCode ? { code: couponCode, discount_amount: discount } : undefined,
      subtotal,
      shipping_fee,
      discount,
      final_price,
      note,
      status: "pending",
      paymentStatus: "pending"
    });

    try {
      await order.save({ session });

      // Xóa các sản phẩm đã đặt khỏi giỏ hàng
      const cart = await Cart.findOne({ user_id: req.user._id });
      if (cart) {
        // Lọc ra các sản phẩm không nằm trong đơn hàng
        cart.products = cart.products.filter(cartItem => {
          const orderItem = items.find(item => 
            item.productId.toString() === cartItem.product_id.toString() &&
            item.variant.size === cartItem.variant_id?.toString()
          );
          return !orderItem; // Giữ lại các sản phẩm không nằm trong đơn hàng
        });
        await cart.save({ session });
      }

      await session.commitTransaction();
      return res.status(201).json(createdHandler(order, ORDER_MESSAGES.CREATE_SUCCESS));

    } catch (error) {
      // Nếu lưu order thất bại, rollback số lượng tồn kho
      for (const product of updatedProducts) {
        const orderItem = items.find(item => item.productId === product._id.toString());
        if (orderItem) {
          const variant = product.variants.find(v => v.size === orderItem.variant.size);
          if (variant) {
            variant.stock += orderItem.quantity;
            product.stock += orderItem.quantity;
            await product.save({ session });
          }
        }
      }
      throw error; // Ném lỗi để xử lý ở catch block bên ngoài
    }

  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating order:", error);
    return res.status(500).json({
      status: false,
      message: ORDER_MESSAGES.SERVER_ERROR,
      statusCode: 500
    });
  } finally {
    session.endSession();
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      status: true,
      message: ORDER_MESSAGES.GET_LIST_SUCCESS,
      data: orders,
      statusCode: 200
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    return res.status(500).json({
      status: false,
      message: ORDER_MESSAGES.SERVER_ERROR,
      statusCode: 500
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    // Validate order ID
    const validationResult = validateGetOrderById({ id: req.params.id });
    if (!validationResult.success) {
      return res.status(400).json({
        status: false,
        message: ORDER_MESSAGES.INVALID_DATA,
        errors: validationResult.error.errors,
        statusCode: 400
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: ORDER_MESSAGES.NOT_FOUND,
        statusCode: 404
      });
    }

    return res.status(200).json({
      status: true,
      message: ORDER_MESSAGES.GET_BY_ID_SUCCESS,
      data: order,
      statusCode: 200
    });
  } catch (error) {
    console.error("Error getting order:", error);
    return res.status(500).json({
      status: false,
      message: ORDER_MESSAGES.SERVER_ERROR,
      statusCode: 500
    });
  }
};

export const getOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: 'user_id',
        select: 'fullName email phone',
        model: 'Account'
      })
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: `OD-${order._id.toString().slice(-6).toUpperCase()}`,
      user: {
        fullName: order.user_id?.fullName || 'N/A',
        email: order.user_id?.email || 'N/A',
        phone: order.user_id?.phone || 'N/A'
      },
      shippingInfo: {
        fullName: order.shippingAddress.fullName,
        phone: order.shippingAddress.phone,
        address: `${order.shippingAddress.addressLine}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`
      },
      orderItems: order.orderItems.map(item => ({
        productName: item.productName,
        imageUrl: item.imageUrl,
        variant: item.variant,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountedPrice: item.discountedPrice || item.unitPrice,
        total: (item.discountedPrice || item.unitPrice) * item.quantity
      })),
      payment: {
        method: order.payment_method,
        status: order.paymentStatus,
        paymentTime: order.paymentTime
      },
      shipping: {
        method: order.shippingMethod?.name || 'N/A',
        fee: order.shippingMethod?.fee || 0,
        trackingNumber: order.trackingNumber || 'N/A'
      },
      pricing: {
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        discount: order.discount,
        finalPrice: order.final_price
      },
      status: order.status,
      note: order.note || 'N/A',
      coupon: order.coupon?.code ? {
        code: order.coupon.code,
        discountAmount: order.coupon.discount_amount
      } : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return res.status(200).json({
      status: true,
      message: ORDER_MESSAGES.GET_LIST_SUCCESS,
      data: formattedOrders,
      statusCode: 200
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    return res.status(500).json({
      status: false,
      message: ORDER_MESSAGES.SERVER_ERROR,
      statusCode: 500
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;
    if (!ORDER_STATUS_ENUM.includes(newStatus)) {
      return res.status(400).json({
        status: false,
        message: ORDER_MESSAGES.INVALID_DATA,
        error: "Trạng thái không hợp lệ",
        statusCode: 400
      });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        status: false,
        message: ORDER_MESSAGES.NOT_FOUND,
        statusCode: 404
      });
    }
    const currentStatus = order.status;
    if (currentStatus === newStatus) {
      return res.status(400).json({
        status: false,
        message: "Trạng thái đơn hàng đã là " + newStatus,
        statusCode: 400
      });
    }
    // Chỉ cho phép chuyển tiếp đúng flow hoặc huỷ
    if (newStatus !== "cancelled" && !STATUS_FLOW[currentStatus].includes(newStatus)) {
      return res.status(400).json({
        status: false,
        message: `Không thể chuyển từ trạng thái ${currentStatus} sang ${newStatus}`,
        statusCode: 400
      });
    }
    order.status = newStatus;
    await order.save();
    return res.status(200).json({
      status: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
      statusCode: 200
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: ORDER_MESSAGES.SERVER_ERROR,
      error: error.message,
      statusCode: 500
    });
  }
};