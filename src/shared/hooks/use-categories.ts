import { useContext } from "react";
import { CategoryContext } from "@/app/context/category-context";

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}
