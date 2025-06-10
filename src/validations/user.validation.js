import { z } from "zod";

export const updateUserSchema = z.object({
  fullName: z.string().min(1, "Tên không được để trống").optional(),
  phone: z.string()
    .regex(/^0\d{9}$/, "Số điện thoại phải bắt đầu bằng số 0 và có 10 chữ số")
    .optional(),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Giới tính phải là male, female hoặc other" })
  }).optional(),
  birthday: z.string()
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime()) && d <= new Date();
    }, { message: "Ngày sinh không hợp lệ hoặc lớn hơn hiện tại" })
    .optional(),
  address: z.string().optional(),
  avatar: z.string().optional()
});

export const changePasswordSchema = z.object({
  oldPassword: z.string()
    .min(6, "Mật khẩu cũ phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu cũ không được vượt quá 50 ký tự"),
  newPassword: z.string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu mới không được vượt quá 50 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
    ),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
  path: ["confirmPassword"]
}); 