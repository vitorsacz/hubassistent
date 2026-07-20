export const ACCOUNT_TYPES = ["CHECKING", "SAVINGS", "CASH", "WALLET"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const CARD_TYPES = ["CREDIT", "DEBIT"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CATEGORY_TYPES = ["EXPENSE", "INCOME"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const TRANSACTION_TYPES = ["EXPENSE", "INCOME"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const PAYMENT_METHODS = [
  "PIX",
  "DEBIT",
  "CREDIT",
  "CASH",
  "TRANSFER",
  "BOLETO",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const TRANSACTION_SOURCES = ["MANUAL", "IMPORT"] as const;
export type TransactionSource = (typeof TRANSACTION_SOURCES)[number];

export const INVOICE_STATUSES = ["OPEN", "PAID", "OVERDUE"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
