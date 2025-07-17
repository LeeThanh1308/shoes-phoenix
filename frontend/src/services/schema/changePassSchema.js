import { z } from "zod";

export const ChangePassSchemaForget = z
  .object({
    password: z.string().min(8, "Mật khẩu phải ít nhất 8 ký tự."),
    confirmPassword: z.string(),
    code: z.string().regex(/^\d{6}$/, "OTP phải gồm đúng 6 chữ số"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"], // Xác định lỗi nằm ở trường nào
        message: "Mật khẩu xác nhận không trùng khớp.",
      });
    }
  });

export const ChangeMyPassSchema = z
  .object({
    prevPassword: z.string().min(8, "Mật khẩu phải ít nhất 8 ký tự."),
    newPassword: z.string().min(8, "Mật khẩu phải ít nhất 8 ký tự."),
    rePassword: z.string(),
  })
  .superRefine(({ newPassword, rePassword }, ctx) => {
    if (newPassword !== rePassword) {
      ctx.addIssue({
        path: ["rePassword"], // Xác định lỗi nằm ở trường nào
        message: "Mật khẩu xác nhận không trùng khớp.",
      });
    }
  });
