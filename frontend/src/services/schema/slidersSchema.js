import { slugRegex } from "./schema";
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
export const CreatedSlidersSchemaSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(500)
    .regex(slugRegex, { message: "Slug không hợp lệ" }),
  src: z.string().optional(),
  href: z.union([z.string().url(), z.literal(""), z.undefined()]),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "File size must be less than 5MB.",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only .jpg, .png, and .webp formats are supported.",
    })
    .optional(),
});
