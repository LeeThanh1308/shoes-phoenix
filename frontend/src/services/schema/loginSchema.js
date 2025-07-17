import { z } from "zod";

export const LoginAccountSchema = z.object({
  emailAndPhone: z
    .string()
    .min(1, "Email hoặc số điện thoại không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});
