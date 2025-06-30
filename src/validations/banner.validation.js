import { z } from "zod";

export const createBannerValidation = z.object({
  title: z.string().min(1, "Tiêu đề banner không được để trống").max(255, "Tiêu đề banner không được vượt quá 255 ký tự").trim(),
  image: z.string().optional(),
  link: z.string().url("Link không hợp lệ").optional().or(z.literal("")),
  description: z.string().max(1000, "Mô tả không được vượt quá 1000 ký tự").optional().or(z.literal("")),
   isActive: z.preprocess(
    (val) => val === 'true' || val === true, 
    z.boolean()
  ).optional().default(true)
});

export const updateBannerValidation = z.object({
  title: z.string().min(1, "Tiêu đề banner không được để trống").max(255, "Tiêu đề banner không được vượt quá 255 ký tự").trim().optional(),
  image: z.string().optional(),
  link: z.string().url("Link không hợp lệ").optional().or(z.literal("")),
  description: z.string().max(1000, "Mô tả không được vượt quá 1000 ký tự").optional().or(z.literal("")),
   isActive: z.preprocess(
    (val) => val === 'true' || val === true, 
    z.boolean()
  ).optional().default(true)
});

export const bannerIdValidation = z.object({
  id: z.string().length(24, "ID banner không hợp lệ").regex(/^[0-9a-fA-F]{24}$/, "ID banner không hợp lệ")
}); 