import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  PaymentMethod,
  TransactionSource,
  TransactionType,
  UpdateTransactionInput,
} from "@hubassistent/shared-types";
import { apiClient } from "@/lib/api-client";

export interface Transaction {
  id: string;
  accountId: string | null;
  cardId: string | null;
  invoiceId: string | null;
  categoryId: string | null;
  type: TransactionType;
  method: PaymentMethod;
  amount: string;
  description: string;
  date: string;
  notes: string | null;
  source: TransactionSource;
  createdAt: string;
}

function buildQueryString(filters?: ListTransactionsQuery) {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.accountId) params.set("accountId", filters.accountId);
  if (filters.cardId) params.set("cardId", filters.cardId);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.dateFrom) params.set("dateFrom", new Date(filters.dateFrom).toISOString());
  if (filters.dateTo) params.set("dateTo", new Date(filters.dateTo).toISOString());
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useTransactions(filters?: ListTransactionsQuery) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => apiClient.get<Transaction[]>(`/transactions${buildQueryString(filters)}`),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) => apiClient.post<Transaction>("/transactions", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTransactionInput }) =>
      apiClient.patch<Transaction>(`/transactions/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/transactions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
