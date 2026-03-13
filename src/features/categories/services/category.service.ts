import { databases, ID, Query } from "@/config/appwrite";
import { Permission, Role, type Models } from "appwrite";
import { processInChunks } from "@/shared/lib/utils";
import type { Category } from "@/features/categories/types/category.types";


const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const CATEGORIES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID || "categories";
const TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID || "tasks";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function documentToCategory(doc: Models.DefaultDocument): Category {
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

    const doc = await databases.updateDocument<Models.DefaultDocument>(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      categoryId,
      payload
    );
    return documentToCategory(doc);
  },

  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    // Get category name to find associated tasks
    const categoryDoc = await databases.getDocument(
      DATABASE_ID,
      CATEGORIES_COLLECTION_ID,
      categoryId
    );
    const categoryName = categoryDoc.name;

    // Unassign category from all tasks that use it
    try {
      const tasks = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.equal("categoryId", categoryName),
        Query.limit(500),
      ]);
      await processInChunks(tasks.documents, (doc) =>
        databases.updateDocument<Models.DefaultDocument>(DATABASE_ID, TASKS_COLLECTION_ID, doc.$id, {
          categoryId: null,
        })
      );
    } catch {
      // Tasks collection may not exist or no tasks, continue
    }

    await databases.deleteDocument(DATABASE_ID, CATEGORIES_COLLECTION_ID, categoryId);
  },
};
