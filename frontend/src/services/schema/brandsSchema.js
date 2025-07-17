import { z } from "zod";
export const brandsSchema = z.object({
  name: z.string().min(1).max(255).nonempty(),
  slug: z.string().min(1).max(255).nonempty(),
  logo: z.string().optional(),
  description: z.string().optional(),
  file: z
    .any()
    .optional() // Cho phép không chọn file
    .refine(
      (files) => !files || files.length === 0 || files[0] instanceof File,
      "Tệp không hợp lệ"
    )
    .refine(
      (files) =>
        !files || files.length === 0 || files[0]?.size < 2 * 1024 * 1024,
      "Ảnh phải nhỏ hơn 2MB"
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ["image/jpeg", "image/png", "image/webp"].includes(files[0]?.type),
      "Chỉ chấp nhận JPG, PNG, WEBP"
    ),
});
