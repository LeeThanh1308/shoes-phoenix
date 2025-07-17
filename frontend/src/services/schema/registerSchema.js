import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/avif",
];
const FieldNotNull = "Trường này không được để trống.";
export const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ."),
    password: z.string().min(8, "Mật khẩu phải ít nhất 8 ký tự."),
    confirmPassword: z.string(),
    fullname: z.string().min(1, FieldNotNull),
    birthday: z.coerce.date().refine((date) => date <= new Date(), {
      message: "Ngày sinh không hợp lệ.",
    }),
    gender: z.string().min(1, FieldNotNull),
    phone: z
      .string()
      .min(1, FieldNotNull)
      .regex(
        /^\d{10,11}$/,
        "Số điện thoại không hợp lệ (phải có 10-11 chữ số)."
      ),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"], // Xác định lỗi nằm ở trường nào
        message: "Mật khẩu xác nhận không trùng khớp.",
      });
    }
  });

export const registerSchemaUpdated = z
  .object({
    id: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    fullname: z.string().min(1, FieldNotNull),
    birthday: z.coerce.date().refine((date) => date <= new Date(), {
      message: "Ngày sinh không hợp lệ.",
    }),
    gender: z.string().min(1, FieldNotNull),
    phone: z
      .string()
      .min(1, FieldNotNull)
      .regex(
        /^\d{10,11}$/,
        "Số điện thoại không hợp lệ (phải có 10-11 chữ số)."
      ),
    email: z.string().email("Email không hợp lệ."),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          message: "Mật khẩu xác nhận không trùng khớp.",
        });
      }
    }
  });

export const UpdateInfoUserSchema = z
  .object({
    id: z.string().optional(),
    fullname: z.string().min(1, FieldNotNull),
    birthday: z.coerce.date().refine((date) => date <= new Date(), {
      message: "Ngày sinh không hợp lệ.",
    }),
    gender: z.string().min(1, FieldNotNull),
    phone: z
      .string()
      .min(1, FieldNotNull)
      .regex(
        /^\d{10,11}$/,
        "Số điện thoại không hợp lệ (phải có 10-11 chữ số)."
      ),
    email: z.string().email("Email không hợp lệ."),
    file: z
      .instanceof(File)
      .refine((file) => file.size <= MAX_FILE_SIZE, {
        message: "File size must be less than 5MB.",
      })
      .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: "Only .jpg, .png, and .webp formats are supported.",
      })
      .optional(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          message: "Mật khẩu xác nhận không trùng khớp.",
        });
      }
    }
  });
