import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CardType, CreateCardInput, UpdateCardInput } from "@hubassistent/shared-types";
import { apiClient } from "@/lib/api-client";

export interface Card {
  id: string;
  accountId: string | null;
  name: string;
  brand: string | null;
  type: CardType;
  closingDay: number | null;
  dueDay: number | null;
  limit: string | null;
  createdAt: string;
}

export function useCards() {
  return useQuery({
    queryKey: ["cards"],
    queryFn: () => apiClient.get<Card[]>("/cards"),
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCardInput) => apiClient.post<Card>("/cards", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cards"] }),
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCardInput }) =>
      apiClient.patch<Card>(`/cards/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cards"] }),
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/cards/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cards"] }),
  });
}
