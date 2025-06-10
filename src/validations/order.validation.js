import { z } from "zod";
import { ORDER_MESSAGES } from "../constants/message.js";

// Shipping Address Schema
const shippingAddressSchema = z.object({
  fullName: z.string().min(1, ORDER_MESSAGES.INVALID_DATA),
  phone: z.string().min(10, ORDER_MESSAGES.INVALID_DATA),
  addressLine: z.string().min(1, ORDER_MESSAGES.INVALID_DATA),
  ward: z.string().min(1, ORDER_MESSAGES.INVALID_DATA),
  district: z.string().min(1, ORDER_MESSAGES.INVALID_DATA),
  province: z.string().min(1, ORDER_MESSAGES.INVALID_DATA),
});

// Shipping Method Schema
const shippingMethodSchema = z.object({
  name: z.string().min(1, ORDER_MESSAGES.INVALID_DATA),
  fee: z.number().min(0, ORDER_MESSAGES.INVALID_DATA),
});

// Order Item Schema
const orderItemSchema = z.object({
  productId: z.string().min(1, ORDER_MESSAGES.INVALID_DATA),
  variant: z.object({
    size: z.string().min(1, ORDER_MESSAGES.INVALID_DATA),
  }),
  quantity: z.number().int().min(1, ORDER_MESSAGES.INVALID_DATA),
});

// Create Order Schema
export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  shippingMethod: shippingMethodSchema,
  payment_method: z.enum(["cod", "vnpay"], {
    errorMap: () => ({ message: ORDER_MESSAGES.INVALID_DATA }),
  }),
  items: z.array(orderItemSchema).min(1, ORDER_MESSAGES.INVALID_DATA),
  couponCode: z.string().optional(),
  note: z.string().optional(),
});

// Validate Create Order
export const validateCreateOrder = (data) => {
  return createOrderSchema.safeParse(data);
};

// Get Order By ID Schema
export const getOrderByIdSchema = z.object({
  id: z.string().min(1, ORDER_MESSAGES.INVALID_DATA),
});

// Validate Get Order By ID
export const validateGetOrderById = (data) => {
  return getOrderByIdSchema.safeParse(data);
}; 