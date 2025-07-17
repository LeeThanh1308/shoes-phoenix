import { FieldNotNullMessage } from "./schema";
import { z } from "zod";

export const sizesSchema = z
  .object({
    costPrice: z.coerce.number().min(1, FieldNotNullMessage).optional(), // >= 0
    sellingPrice: z.coerce.number().min(1, FieldNotNullMessage).optional(), // >= 0
    type: z.string().nonempty(),
    discount: z.coerce.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
    productId: z
      .string()
      .min(1, FieldNotNullMessage)
      .transform((val) => Number(val)),
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
