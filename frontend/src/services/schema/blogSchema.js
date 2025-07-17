import { z } from "zod";

export const blogSchema = z.object({
  id: z.number().optional(),
  title: z.string().max(160).nonempty("Title is required"),
  slug: z.string().nonempty("Slug is required"),
  description: z.string().nonempty("Description is required"),
});
