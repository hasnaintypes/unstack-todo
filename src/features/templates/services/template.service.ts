import { databases, ID, Query } from "@/config/appwrite";
import { Permission, Role, type Models } from "appwrite";
import type { TaskTemplate } from "../types/template.types";

import type { Subtask, TaskPriority } from "@/features/tasks/types/task.types";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TEMPLATES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_TASK_TEMPLATES_COLLECTION_ID || "task_templates";

function safeParseSubtasks(raw: string): Subtask[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function documentToTemplate(doc: Models.DefaultDocument): TaskTemplate {
  return {
    id: doc.$id,
    userId: doc.userId,
    name: doc.name,
    title: doc.title,
    description: doc.description || undefined,
    priority: (doc.priority as TaskPriority) || 2,
    subtasks: doc.subtasks ? safeParseSubtasks(doc.subtasks) : undefined,
    category: doc.categoryId || undefined,
    project: doc.projectId || undefined,
  };
}

export const templateService = {
  async getTemplates(userId: string): Promise<TaskTemplate[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, TEMPLATES_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]);
      return response.documents.map(documentToTemplate);
    } catch (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
  },

  async createTemplate(
    template: Omit<TaskTemplate, "id">,
    userId: string
  ): Promise<TaskTemplate> {
    const doc = await databases.createDocument(
      DATABASE_ID,
      TEMPLATES_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        name: template.name,
        title: template.title,
        description: template.description || null,
        priority: template.priority || 2,
        subtasks: template.subtasks ? JSON.stringify(template.subtasks) : null,
        categoryId: template.category || null,
        projectId: template.project || null,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return documentToTemplate(doc);
  },

  async deleteTemplate(templateId: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, TEMPLATES_COLLECTION_ID, templateId);
  },
};
