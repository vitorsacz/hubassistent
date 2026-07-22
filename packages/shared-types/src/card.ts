import { z } from "zod";
import { CARD_TYPES } from "./enums";

export const createCardSchema = z.object({
  name: z.string().min(1),
  type: z.enum(CARD_TYPES),
  brand: z.string().min(1).optional(),
  bank: z.string().min(1).optional(),
  accountId: z.string().optional(),
  closingDay: z.number().int().min(1).max(31).optional(),
  dueDay: z.number().int().min(1).max(31).optional(),
  limit: z.number().positive().optional(),
});
export type CreateCardInput = z.infer<typeof createCardSchema>;

export const updateCardSchema = createCardSchema.partial();
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
