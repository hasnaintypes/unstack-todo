import { databases, ID, Query } from "@/config/appwrite";
import { Permission, Role } from "appwrite";
import type { Category } from "@/features/categories/types/category.types";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const CATEGORIES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID || "categories";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function documentToCategory(doc: any): Category {
  return {
    id: doc.$id,
    name: doc.name,
    userId: doc.userId,
    color: doc.color || undefined,
  };
}

export const categoryService = {
  async getAllCategories(userId: string): Promise<Category[]> {
    const response = await databases.listDocuments(DATABASE_ID, CATEGORIES_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.orderAsc("name"),
      Query.limit(100),
    ]);
    return response.documents.map(documentToCategory);
  },

  async createCategory(data: { name: string; color?: string }, userId: string): Promise<Category> {
    const doc = await databases.createDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      ID.unique(),
      {
        name: data.name,
        slug: generateSlug(data.name),
        color: data.color || null,
        userId,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return documentToCategory(doc);
  },

  async updateCategory(
    categoryId: string,
    updates: Partial<Pick<Category, "name" | "color">>
  ): Promise<Category> {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) {
      payload.name = updates.name;
      payload.slug = generateSlug(updates.name);
    }
    if (updates.color !== undefined) payload.color = updates.color || null;

    const doc = await databases.updateDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      categoryId,
      payload
    );
    return documentToCategory(doc);
  },

  async deleteCategory(categoryId: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, CATEGORIES_COLLECTION_ID, categoryId);
  },
};
