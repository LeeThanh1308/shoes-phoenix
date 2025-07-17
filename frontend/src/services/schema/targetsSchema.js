import { z } from "zod";

export const targetsSchema = z.object({
  name: z.string().min(1).max(255).nonempty(),
});
