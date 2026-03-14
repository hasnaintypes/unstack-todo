import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Category } from "@/features/categories/types/category.types";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CategoryContext, type CategoryContextValue } from "@/app/context/category-context";
import { queryKeys } from "@/shared/lib/query-keys";
import {
  useCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/features/categories/hooks/use-categories-query";

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.$id;
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useCategoriesQuery(userId);

  const addCategoryMutation = useAddCategoryMutation(userId);
  const updateCategoryMutation = useUpdateCategoryMutation(userId);
  const deleteCategoryMutation = useDeleteCategoryMutation(userId);

  const addCategory = React.useCallback(
    async (data: { name: string; color?: string }) => {
      if (!userId) throw new Error("User not authenticated");
      return addCategoryMutation.mutateAsync(data);
    },
    [userId, addCategoryMutation]
  );

  const updateCategory = React.useCallback(
    async (id: string, updates: Partial<Pick<Category, "name" | "color">>) => {
      await updateCategoryMutation.mutateAsync({ id, updates });
    },
    [updateCategoryMutation]
  );

  const deleteCategory = React.useCallback(
    async (id: string) => {
      if (!userId) throw new Error("User not authenticated");
      await deleteCategoryMutation.mutateAsync(id);
    },
    [userId, deleteCategoryMutation]
  );

  const refreshCategories = React.useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({
      queryKey: queryKeys.categories.all(userId),
    });
  }, [userId, queryClient]);

  const value: CategoryContextValue = {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}
