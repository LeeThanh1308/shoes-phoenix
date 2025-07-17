import { FieldNotNullMessage } from "./schema";
import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, FieldNotNullMessage).email("Email không hợp lệ."),
  phone: z
    .string()
    .min(1, FieldNotNullMessage)
    .regex(/^\d{10,11}$/, "Số điện thoại không hợp lệ (phải có 10-11 chữ số)."),
});
