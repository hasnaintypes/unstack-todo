import { databases, ID, Query } from "@/config/appwrite";
import { Permission, Role, type Models } from "appwrite";
import type { Project } from "@/features/projects/types/project.types";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROJECTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID || "projects";
const TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID || "tasks";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function documentToProject(doc: Models.Document): Project {
  return {
    id: doc.$id,
    name: doc.name,
    description: doc.description || undefined,
    color: doc.color || "blue",
    icon: doc.icon || undefined,
    userId: doc.userId,
    isFavorite: false,
    isArchived: false,
    order: doc.position ?? 0,
  };
}

export const projectService = {
  async getAllProjects(userId: string): Promise<Project[]> {
    const response = await databases.listDocuments(DATABASE_ID, PROJECTS_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.orderAsc("$createdAt"),
      Query.limit(100),
    ]);
    return response.documents.map(documentToProject);
  },

  async createProject(
    data: { name: string; description?: string; color?: string; icon?: string },
    userId: string
  ): Promise<Project> {
    const doc = await databases.createDocument(
      DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      ID.unique(),
      {
        name: data.name,
        slug: generateSlug(data.name),
        description: data.description || null,
        color: data.color || "blue",
        icon: data.icon || null,
        userId,
        position: 0,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return documentToProject(doc);
  },

  async updateProject(
    projectId: string,
    updates: Partial<
      Pick<
        Project,
        "name" | "description" | "color" | "icon" | "isFavorite" | "isArchived" | "order"
      >
    >
  ): Promise<Project> {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) {
      payload.name = updates.name;
      payload.slug = generateSlug(updates.name);
    }
    if (updates.description !== undefined) payload.description = updates.description || null;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.icon !== undefined) payload.icon = updates.icon || null;
    if (updates.order !== undefined) payload.position = updates.order;

    const doc = await databases.updateDocument(
      DATABASE_ID,
      PROJECTS_COLLECTION_ID,
      projectId,
      payload
    );
    return documentToProject(doc);
  },

  async deleteProject(projectId: string, userId: string): Promise<void> {
    // Get project name to find associated tasks
    const projectDoc = await databases.getDocument(DATABASE_ID, PROJECTS_COLLECTION_ID, projectId);
    const projectName = projectDoc.name;

    // Unassign all tasks that belong to this project (move to inbox)
    try {
      const tasks = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.equal("projectId", projectName),
        Query.limit(500),
      ]);
      await Promise.all(
        tasks.documents.map((doc) =>
          databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, doc.$id, {
            projectId: null,
          })
        )
      );
    } catch {
      // Tasks collection may not exist or no tasks, continue
    }

    await databases.deleteDocument(DATABASE_ID, PROJECTS_COLLECTION_ID, projectId);
  },
};
