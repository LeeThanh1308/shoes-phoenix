import { FieldNotNullMessage } from "./schema";
import { z } from "zod";

export const productsSubSizesSchema = z
  .object({
    id: z.number().optional(),
    costPrice: z.coerce.number().optional(), // >= 0
    sellingPrice: z.coerce.number().optional(), // >= 0
    type: z.string().nonempty(),
    discount: z.coerce.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const { costPrice, sellingPrice } = data;
    if (costPrice && sellingPrice)
      if (
        typeof costPrice === "number" &&
        typeof sellingPrice === "number" &&
        sellingPrice <= costPrice
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Giá bán phải lớn hơn giá vốn",
          path: ["sellingPrice"],
        });
      }
  });

export const productsSubColorsSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(255).nonempty(),
  hexCode: z
    .string()
    .length(7)
    .regex(/^#([A-Fa-f0-9]{6})$/)
    .nonempty(),
  files: z
    .array(z.any())
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        files.every((file) => file instanceof File),
      { message: "Tệp không hợp lệ" }
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        files.every(
          (file) =>
            file.size <
            process.env.NEXT_PUBLIC_MAX_SIZE_FILE_UPLOAD_MB * 1024 * 1024
        ),
      { message: "Mỗi ảnh phải nhỏ hơn 5MB" }
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        files.every((file) =>
          [
            "image/jpg",
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/webp",
            "image/avif",
          ].includes(file.type)
        ),
      { message: "Chỉ chấp nhận JPG, PNG, WEBP" }
    ),
});

export const productsSchema = z
  .object({
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    barcode: z.string().min(1),
    description: z.string().nullable().optional(),
    costPrice: z.coerce.number().min(1, FieldNotNullMessage), // >= 0
    sellingPrice: z.coerce.number().min(1, FieldNotNullMessage), // >= 0
    discount: z.coerce.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
    // Foreign key dạng number
    brandID: z
      .string()
      .min(1, FieldNotNullMessage)
      .transform((val) => Number(val)),
    targetGroupID: z
      .string()
      .min(1, FieldNotNullMessage)
      .transform((val) => Number(val)),
    categoryID: z
      .string()
      .min(1, FieldNotNullMessage)
      .transform((val) => Number(val)),
    // Array ID cũng là số
    colors: z.array(productsSubColorsSchema),
    sizes: z
      .array(productsSubSizesSchema)
      .min(1, "There must be at least one size for the product"),
  })
  .superRefine((data, ctx) => {
    const { costPrice, sellingPrice } = data;
    if (
      typeof costPrice === "number" &&
      typeof sellingPrice === "number" &&
      sellingPrice <= costPrice
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Giá bán phải lớn hơn giá vốn",
        path: ["sellingPrice"],
      });
    }
  });

export const productsSchemaUpdated = z
  .object({
    id: z.number(),
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    barcode: z.string().min(1),
    description: z.string().nullable().optional(),

    costPrice: z.coerce.number().min(1, FieldNotNullMessage), // >= 0
    sellingPrice: z.coerce.number().min(1, FieldNotNullMessage), // >= 0
    discount: z.coerce.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
    // Foreign key dạng number
    brandID: z
      .string()
      .min(1, FieldNotNullMessage)
      .transform((val) => Number(val)),
    targetGroupID: z
      .string()
      .min(1, FieldNotNullMessage)
      .transform((val) => Number(val)),
    categoryID: z
      .string()
      .min(1, FieldNotNullMessage)
      .transform((val) => Number(val)),

    // Array ID cũng là số
    colors: z.array(productsSubColorsSchema).optional(),
    images: z
      .array(
        z.object({
          id: z.number().optional(),
          src: z.string(),
          color: z.object({
            id: z.number().positive(),
            name: z.string().min(1).max(255).nonempty(),
            hexCode: z
              .string()
              .length(7)
              .regex(/^#([A-Fa-f0-9]{6})$/)
              .nonempty(),
          }),
        })
      )
      .optional(),
    sizes: z.array(productsSubSizesSchema).optional(),
    removes: z
      .object({
        images: z.array(z.number()).optional(),
        colors: z.array(z.number().int()).optional(),
        sizes: z.array(z.number().int()).optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const { costPrice, sellingPrice } = data;
    if (
      typeof costPrice === "number" &&
      typeof sellingPrice === "number" &&
      sellingPrice <= costPrice
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Giá bán phải lớn hơn giá vốn",
        path: ["sellingPrice"],
      });
    }
  });
