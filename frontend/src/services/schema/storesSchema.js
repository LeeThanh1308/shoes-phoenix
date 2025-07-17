import { FieldNotNullMessage } from "./schema";
import { z } from "zod";

export const storeItemsSchema = z.object({
  quantity: z
    .string()
    .min(1, FieldNotNullMessage)
    .transform((val) => Number(val)),

  productID: z
    .string()
    .min(1, FieldNotNullMessage)
    .transform((val) => Number(val)),

  colorID: z
    .string()
    .min(1, FieldNotNullMessage)
    .transform((val) => Number(val))
    .optional(),

  sizeID: z
    .string()
    .min(1, FieldNotNullMessage)
    .transform((val) => Number(val))
    .optional(),
  product: z.object({}).passthrough(),
  size: z.object({}).passthrough().optional(),
  color: z.object({}).passthrough().optional(),
});

export const storeItemsSchemaUpdate = z.object({
  id: z.number().optional(),
  quantity: z
    .string()
    .min(1, FieldNotNullMessage)
    .transform((val) => {
      if (typeof val == "string") {
        return Number(val);
      } else {
        return val;
      }
    }),

  productID: z
    .string()
    .min(1, FieldNotNullMessage)
    .transform((val) => Number(val)),

  colorID: z
    .string()
    .min(1, FieldNotNullMessage)
    .transform((val) => Number(val))
    .optional(),

  sizeID: z
    .string()
    .min(1, FieldNotNullMessage)
    .transform((val) => Number(val)),
  product: z.object({}).passthrough(),
  size: z.object({}).passthrough(),
  color: z.object({}).passthrough().optional(),
});

export const storeSchema = z.object({
  branchID: z
    .string()
    .min(1, FieldNotNullMessage)
    .transform((val) => Number(val)),
  items: z.array(
    z.object({
      quantity: z.coerce.number().min(1, FieldNotNullMessage),
      productID: z.coerce.number().min(1, FieldNotNullMessage),
      colorID: z.coerce.number().min(1, FieldNotNullMessage),
      sizeID: z.coerce.number().min(1, FieldNotNullMessage),
      product: z.object({}).passthrough(),
      size: z.object({}).passthrough().optional(),
      color: z.object({}).passthrough().optional(),
    })
  ),
});

export const storeSchemaUpdate = z.object({
  id: z.number(),
  items: z.array(
    z.object({
      id: z.number().optional(),
      quantity: z.coerce.number().min(1, FieldNotNullMessage),
      product: z.object({}).passthrough(),
      colorID: z.coerce.number().min(1, FieldNotNullMessage),
      sizeID: z.coerce.number().min(1, FieldNotNullMessage),
      size: z.object({}).passthrough().optional(),
      color: z.object({}).passthrough().optional(),
    })
  ),
});
