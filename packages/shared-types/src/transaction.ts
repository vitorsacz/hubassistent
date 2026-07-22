import { z } from "zod";
import { PAYMENT_METHODS, TRANSACTION_TYPES } from "./enums";

export const createTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  method: z.enum(PAYMENT_METHODS),
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.coerce.date(),
  notes: z.string().optional(),
  accountId: z.string().optional(),
  cardId: z.string().optional(),
  invoiceId: z.string().optional(),
  categoryId: z.string().optional(),
  installmentNumber: z.number().int().positive().optional(),
  installmentTotal: z.number().int().positive().optional(),
});
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.partial();
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const listTransactionsQuerySchema = z.object({
  accountId: z.string().optional(),
  cardId: z.string().optional(),
  categoryId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
