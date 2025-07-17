import { z } from "zod";

export const colorsSchema = z.object({
  name: z.string().min(1).max(255).nonempty(),
  hexCode: z
    .string()
    .length(7)
    .regex(/^#([A-Fa-f0-9]{6})$/)
    .nonempty(),
});
