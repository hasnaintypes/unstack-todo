import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "@/features/categories/services/category.service";
import { queryKeys } from "@/shared/lib/query-keys";
import type { Category } from "@/features/categories/types/category.types";

export function useCategoriesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.all(userId ?? ""),
    queryFn: () => categoryService.getAllCategories(userId!),
    enabled: !!userId,
  });
}

export function useAddCategoryMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.categories.all(userId ?? "");

  return useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      categoryService.createCategory(data, userId!),
    onSuccess: (newCategory, data) => {
      queryClient.setQueryData<Category[]>(queryKey, (old) =>
        old ? [...old, newCategory] : [newCategory]
      );
      toast.success(`Category "${data.name}" created`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateCategoryMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.categories.all(userId ?? "");

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<Category, "name" | "color">>;
    }) => categoryService.updateCategory(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<Category[]>(queryKey, (old) =>
        old?.map((c) => (c.id === updated.id ? updated : c))
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDeleteCategoryMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.categories.all(userId ?? "");

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id, userId!),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Category[]>(queryKey);
      queryClient.setQueryData<Category[]>(queryKey, (old) =>
        old?.filter((c) => c.id !== id)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
