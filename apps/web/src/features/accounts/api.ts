import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AccountType, CreateAccountInput, UpdateAccountInput } from "@hubassistent/shared-types";
import { apiClient } from "@/lib/api-client";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  createdAt: string;
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () => apiClient.get<Account[]>("/accounts"),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountInput) => apiClient.post<Account>("/accounts", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) =>
      apiClient.patch<Account>(`/accounts/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/accounts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}
