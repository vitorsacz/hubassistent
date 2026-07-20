import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CategoryType, CreateCategoryInput, UpdateCategoryInput } from "@hubassistent/shared-types";
import { apiClient } from "@/lib/api-client";

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.get<Category[]>("/categories"),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => apiClient.post<Category>("/categories", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      apiClient.patch<Category>(`/categories/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}
