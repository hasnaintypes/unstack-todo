import { createContext } from "react";
import type { Category } from "@/features/categories/types/category.types";

export interface CategoryContextValue {
  categories: Category[];
  isLoading: boolean;
  addCategory: (data: { name: string; color?: string }) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Pick<Category, "name" | "color">>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

export const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);
