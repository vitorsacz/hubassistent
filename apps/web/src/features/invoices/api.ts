import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateInvoiceInput,
  ImportInvoiceInput,
  InvoiceStatus,
  ListInvoicesQuery,
  UpdateInvoiceInput,
} from "@hubassistent/shared-types";
import { apiClient } from "@/lib/api-client";
import type { Card } from "@/features/cards/api";

export interface ParsedInvoiceItem {
  date: string | null;
  description: string;
  amount: number | null;
  installmentNumber?: number;
  installmentTotal?: number;
}

export interface ParsedInvoicePreview {
  referenceMonth: string | null;
  dueDate: string | null;
  bank: string | null;
  items: ParsedInvoiceItem[];
}

export interface Invoice {
  id: string;
  cardId: string | null;
  card: Card | null;
  referenceMonth: string;
  dueDate: string;
  amount: string | null;
  status: InvoiceStatus;
  paidAt: string | null;
  createdAt: string;
}

function buildQueryString(filters?: ListInvoicesQuery) {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.cardId) params.set("cardId", filters.cardId);
  if (filters.month) params.set("month", filters.month);
  if (filters.bank) params.set("bank", filters.bank);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useInvoices(filters?: ListInvoicesQuery) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => apiClient.get<Invoice[]>(`/invoices${buildQueryString(filters)}`),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => apiClient.post<Invoice>("/invoices", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInvoiceInput }) =>
      apiClient.patch<Invoice>(`/invoices/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/invoices/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useParseInvoicePdf() {
  return useMutation({
    mutationFn: ({ file, cardId }: { file: File; cardId: string }) => {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("cardId", cardId);
      return apiClient.postForm<ParsedInvoicePreview>("/invoices/parse-pdf", formData);
    },
  });
}

export function useImportInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ImportInvoiceInput) => apiClient.post<Invoice>("/invoices/import", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
