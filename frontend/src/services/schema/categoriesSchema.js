import { slugRegex } from "./schema";
import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(500)
    .regex(slugRegex, { message: "Slug không hợp lệ" })
    .optional(),
  icon: z.string().optional(),
  file: z
    .any()
    .optional() // Cho phép không chọn file
    .refine(
      (files) => !files || files.length === 0 || files[0] instanceof File,
      "Tệp không hợp lệ"
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        files[0]?.size <
          +process.env.NEXT_PUBLIC_MAX_SIZE_FILE_UPLOAD_MB * 1024 * 1024,
      "Ảnh phải nhỏ hơn 2MB"
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        [
          "image/jpg",
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/bmp",
          "image/webp",
          "image/avif",
        ].includes(files[0]?.type),
      "Chỉ chấp nhận JPG, PNG, WEBP"
    ),
  isActive: z.boolean().optional(),
  parentId: z.number().optional(),
});
