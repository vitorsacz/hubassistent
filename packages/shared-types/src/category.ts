import { z } from "zod";
import { CATEGORY_TYPES } from "./enums";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(CATEGORY_TYPES),
  icon: z.string().optional(),
  color: z.string().optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
