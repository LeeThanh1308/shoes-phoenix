import { z } from "zod";

export const branchesSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  phone: z
    .string()
    .regex(
      /^(\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/,
      "Số điện thoại không hợp lệ"
    ),
  longitude: z.coerce
    .number()
    .min(1, "Longitude is required.")
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  latitude: z.coerce
    .number()
    .min(1, "Latitude is required.")
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
});
