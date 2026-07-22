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

export const listInvoicesQuerySchema = z.object({
  cardId: z.string().optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  bank: z.string().optional(),
});
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;

export const invoiceImportItemSchema = z.object({
  date: z.coerce.date(),
  description: z.string().min(1),
  amount: z.number().positive(),
  installmentNumber: z.number().int().positive().optional(),
  installmentTotal: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
});
export type InvoiceImportItem = z.infer<typeof invoiceImportItemSchema>;

export const importInvoiceSchema = z.object({
  cardId: z.string(),
  referenceMonth: z.coerce.date(),
  dueDate: z.coerce.date(),
  items: z.array(invoiceImportItemSchema).min(1),
});
export type ImportInvoiceInput = z.infer<typeof importInvoiceSchema>;

export const parsedInvoiceItemSchema = z.object({
  date: z.coerce.date().nullable(),
  description: z.string(),
  amount: z.number().nullable(),
  installmentNumber: z.number().int().positive().optional(),
  installmentTotal: z.number().int().positive().optional(),
});
export type ParsedInvoiceItem = z.infer<typeof parsedInvoiceItemSchema>;

export const parsedInvoicePreviewSchema = z.object({
  referenceMonth: z.coerce.date().nullable(),
  dueDate: z.coerce.date().nullable(),
  bank: z.string().nullable(),
  items: z.array(parsedInvoiceItemSchema),
});
export type ParsedInvoicePreview = z.infer<typeof parsedInvoicePreviewSchema>;
