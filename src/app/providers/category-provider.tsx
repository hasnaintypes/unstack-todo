import * as React from "react";
import { toast } from "sonner";
import type { Category } from "@/features/categories/types/category.types";
import { categoryService } from "@/features/categories/services/category.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CategoryContext, type CategoryContextValue } from "@/app/context/category-context";

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { user } = useAuth();

  const loadCategories = React.useCallback(async () => {
    if (!user?.$id) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const fetched = await categoryService.getAllCategories(user.$id);
      setCategories(fetched);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.$id]);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = React.useCallback(
    async (data: { name: string; color?: string }) => {
      if (!user?.$id) throw new Error("User not authenticated");
      const newCategory = await categoryService.createCategory(data, user.$id);
      setCategories((prev) => [...prev, newCategory]);
      toast.success(`Category "${data.name}" created`);
      return newCategory;
    },
    [user?.$id]
  );

  const updateCategory = React.useCallback(
    async (id: string, updates: Partial<Pick<Category, "name" | "color">>) => {
      const updated = await categoryService.updateCategory(id, updates);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    },
    []
  );

  const deleteCategory = React.useCallback(async (id: string) => {
    await categoryService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value: CategoryContextValue = {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: loadCategories,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}
