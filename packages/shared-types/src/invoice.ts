import { z } from "zod";
import { INVOICE_STATUSES } from "./enums";

export const createInvoiceSchema = z.object({
  cardId: z.string().optional(),
  referenceMonth: z.coerce.date(),
  dueDate: z.coerce.date(),
  amount: z.number().positive().optional(),
});
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const updateInvoiceSchema = z.object({
  dueDate: z.coerce.date().optional(),
  amount: z.number().positive().optional(),
  status: z.enum(INVOICE_STATUSES).optional(),
  paidAt: z.coerce.date().optional(),
});
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
