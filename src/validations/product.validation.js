import { z } from "zod";
import mongoose from "mongoose";

// Schema cho biến thể sản phẩm
const variantSchema = z.object({
  size: z.string().min(1, "Size không được để trống"),
  stock: z.coerce.number().int().positive("Số lượng phải lớn hơn 0")
});

// Schema cho danh sách biến thể
const variantsSchema = z.preprocess(
  (val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val; // Return original value if parsing fails
      }
    }
    return val;
  },
  z.array(variantSchema)
    .min(1, "Cần ít nhất một biến thể")
    .refine(
      (variants) => {
        const sizes = new Set();
        return variants.every(variant => {
          if (sizes.has(variant.size)) return false;
          sizes.add(variant.size);
          return true;
        });
      },
      { message: "Size không được trùng lặp" }
    )
);

// Schema cho thông tin cơ bản của sản phẩm
const productBaseSchema = z.object({
  title: z.string().min(1, "Tên sản phẩm không được để trống"),
  product_category_id: z.string()
    .refine(
      (id) => mongoose.Types.ObjectId.isValid(id),
      "ID danh mục không hợp lệ"
    ),
  price: z.coerce.number().positive("Giá phải lớn hơn 0"),
  description: z.string().optional(),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  status: z.string().optional(),
  position: z.coerce.number().int().optional(),
  thumbnails: z.array(z.object({
    url: z.string(),
    position: z.number(),
    createdAt: z.date(),
    updatedAt: z.date()
  })).optional()
});

// Schema cho tạo sản phẩm mới
export const createProductSchema = productBaseSchema.extend({
  variants: variantsSchema
});

// Schema cho cập nhật sản phẩm
export const updateProductSchema = productBaseSchema.partial().extend({
  variants: variantsSchema.optional()
});

// Schema cho thêm biến thể
export const addVariantsSchema = z.object({
  variants: variantsSchema
});

// Schema cho query parameters
export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  includeDeleted: z.coerce.boolean().optional(),
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional()
});

// Schema cho ID
export const idSchema = z.string().refine(
  (id) => mongoose.Types.ObjectId.isValid(id),
  "ID không hợp lệ"
); 