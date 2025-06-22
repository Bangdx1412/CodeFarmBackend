import { z } from "zod";
import mongoose from "mongoose";

// Schema cho biến thể sản phẩm
const variantSchema = z.object({
  size: z.string().min(1, "Kích thước không được để trống"),
  stock: z.coerce.number().int().min(0, "Số lượng tồn kho phải lớn hơn hoặc bằng 0"),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0").optional(),
  discount: z.number().min(0, "Giảm giá phải lớn hơn hoặc bằng 0").optional(),
  thumbnails: z.array(z.string()).optional(),
});

// Schema cho danh sách biến thể
const variantsSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
    return val;
  },
  z
    .array(variantSchema)
    .min(1, "Cần ít nhất một biến thể")
    .refine(
      (variants) => {
        const sizes = new Set();
        return variants.every((variant) => {
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
  title: z
    .string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(255, "Tên sản phẩm không được quá 255 ký tự"),
  product_category_id: z
    .string()
    .refine(
      (id) => !id || mongoose.Types.ObjectId.isValid(id),
      "ID danh mục không hợp lệ"
    )
    .optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Giá không được âm"),
  discountPercentage: z.coerce
    .number()
    .min(0, "Phần trăm giảm giá không được âm")
    .max(100, "Phần trăm giảm giá không được vượt quá 100")
    .optional(),
  discountStartDate: z.string().datetime().optional(),
  discountEndDate: z.string().datetime().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  position: z.coerce.number().int().min(0, "Vị trí không được âm").optional(),
  thumbnails: z
    .array(
      z.object({
        url: z.string().url("URL ảnh không hợp lệ"),
        position: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
    )
    .optional(),
  stock: z.coerce
    .number()
    .int()
    .min(0, "Số lượng tồn kho không được âm")
    .optional(),
});

// Schema cho tạo sản phẩm mới
export const createProductSchema = z
  .object({
    ...productBaseSchema.shape,
    variants: variantsSchema.optional(),
  })
  .refine(
    (data) => {
      // Nếu có discountPercentage thì phải có cả start và end date
      if (data.discountPercentage > 0) {
        return data.discountStartDate && data.discountEndDate;
      }
      return true;
    },
    {
      message: "Khi có giảm giá phải có thời gian bắt đầu và kết thúc",
      path: ["discountStartDate", "discountEndDate"],
    }
  )
  .refine(
    (data) => {
      // Kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
      if (data.discountStartDate && data.discountEndDate) {
        return (
          new Date(data.discountEndDate) > new Date(data.discountStartDate)
        );
      }
      return true;
    },
    {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      path: ["discountEndDate"],
    }
  );

// Schema cho cập nhật sản phẩm
export const updateProductSchema = z
  .object({
    ...productBaseSchema.shape,
    variants: variantsSchema.optional(),
  })
  .partial()
  .refine(
    (data) => {
      // Nếu có discountPercentage thì phải có cả start và end date
      if (data.discountPercentage > 0) {
        return data.discountStartDate && data.discountEndDate;
      }
      return true;
    },
    {
      message: "Khi có giảm giá phải có thời gian bắt đầu và kết thúc",
      path: ["discountStartDate", "discountEndDate"],
    }
  )
  .refine(
    (data) => {
      // Kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
      if (data.discountStartDate && data.discountEndDate) {
        return (
          new Date(data.discountEndDate) > new Date(data.discountStartDate)
        );
      }
      return true;
    },
    {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      path: ["discountEndDate"],
    }
  );

// Schema cho thêm biến thể
export const addVariantsSchema = z.object({
  variants: z
    .union([z.array(variantSchema), variantSchema])
    .transform((data) => (Array.isArray(data) ? data : [data]))
    .refine(
      (variants) => {
        return variants.length > 0;
      },
      { message: "Cần ít nhất một biến thể" }
    ),
});

// Schema cho cập nhật biến thể
export const updateVariantSchema = z.object({
  size: z.string().min(1, "Kích thước không được để trống"),
  stock: z.coerce.number().int().min(0, "Số lượng tồn kho phải lớn hơn hoặc bằng 0"),
});

// Schema cho xóa biến thể
export const deleteVariantSchema = z.object({
  variantId: z.string().min(1, "ID biến thể không được để trống"),
});

// Schema cho query parameters
export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  includeDeleted: z.coerce.boolean().optional(),
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

// Schema cho ID
export const idSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), "ID không hợp lệ");
