import { databases, ID, Query } from "@/config/appwrite";
import { Permission, Role } from "appwrite";
import type { CalendarTask, TaskStatus, TaskPriority } from "@/features/tasks/types/task.types";

/**
 * Appwrite Database Configuration
 *
 * Required Environment Variables:
 * - VITE_APPWRITE_DATABASE_ID: Your Appwrite database ID
 * - VITE_APPWRITE_TASKS_COLLECTION_ID: Collection ID for tasks
 *
 * Collection Schema (create in Appwrite Console):
 *
 * Collection Name: tasks
 * Attributes:
 * - title (string, required, 256 characters)
 * - description (string, optional, 10000 characters)
 * - dueDate (string, optional, 50 characters) - ISO date string
 * - startTime (string, optional, 50 characters)
 * - endTime (string, optional, 50 characters)
 * - priority (integer, required, min: 1, max: 4, default: 2)
 * - color (string, optional, 50 characters)
 * - category (string, optional, 256 characters)
 * - project (string, optional, 256 characters)
 * - status (string, required, 50 characters, default: "todo")
 * - userId (string, required, 256 characters) - for user isolation
 * - deletedAt (datetime, optional) - for soft delete/trash functionality
 * - completedAt (datetime, optional) - when task was completed
 * - subtasks (string, optional, 10000 characters) - JSON stringified array
 *
 * Indexes (recommended):
 * - userId (key index) - for filtering user's tasks
 * - status (key index) - for filtering by status
 * - dueDate (key index) - for date-based queries
 * - deletedAt (key index) - for trash queries
 * - userId_status (compound) - for combined filtering
 *
 * Permissions:
 * - Document-level: user:{userId} (read, update, delete)
 * - Collection-level: role:authenticated (create)
 */

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID;

if (!DATABASE_ID || !TASKS_COLLECTION_ID) {
  console.error(
    "Missing Appwrite configuration. Please set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_TASKS_COLLECTION_ID in your .env file"
  );
}

/**
 * Convert CalendarTask to Appwrite document format
 */
function taskToDocument(task: Omit<CalendarTask, "id">, userId: string) {
  return {
    title: task.title,
    description: task.description || null,
    dueDate: task.dueDate || null,
    startTime: task.startTime || null,
    endTime: task.endTime || null,
    priority: task.priority || 2,
    color: task.color || "blue",
    category: task.category || null,
    project: task.project || null,
    status: task.status || "todo",
    userId,
    subtasks: task.subtasks ? JSON.stringify(task.subtasks) : null,
    completedAt: task.status === "completed" ? new Date().toISOString() : null,
  };
}

function safeParseSubtasks(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Convert Appwrite document to CalendarTask
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function documentToTask(doc: any): CalendarTask {
  return {
    id: doc.$id,
    title: doc.title,
    description: doc.description || undefined,
    dueDate: doc.dueDate || "",
    startTime: doc.startTime || undefined,
    endTime: doc.endTime || undefined,
    priority: doc.priority as TaskPriority,
    color: doc.color,
    category: doc.category || undefined,
    project: doc.project || undefined,
    status: doc.status as TaskStatus,
    subtasks: doc.subtasks ? safeParseSubtasks(doc.subtasks) : undefined,
  };
}

export const taskService = {
  /**
   * Get all tasks for the current user (excluding deleted)
   */
  async getAllTasks(userId: string): Promise<CalendarTask[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.isNull("deletedAt"),
          Query.orderDesc("$createdAt"),
          Query.limit(1000), // Adjust based on your needs
        ]
      );

      return response.documents.map(documentToTask);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw new Error("Failed to fetch tasks");
    }
  },

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<CalendarTask> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId
      );

      return documentToTask(doc);
    } catch (error) {
      console.error("Error fetching task:", error);
      throw new Error("Failed to fetch task");
    }
  },

  /**
   * Create a new task
   */
  async createTask(
    task: Omit<CalendarTask, "id">,
    userId: string
  ): Promise<CalendarTask> {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        ID.unique(),
        taskToDocument(task, userId),
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );

      return documentToTask(doc);
    } catch (error) {
      console.error("Error creating task:", error);
      throw new Error("Failed to create task");
    }
  },

  /**
   * Update an existing task
   */
  async updateTask(
    taskId: string,
    updates: Partial<CalendarTask>
  ): Promise<CalendarTask> {
    try {
      // Prepare the update payload
      const updatePayload: Record<string, unknown> = {};

      if (updates.title !== undefined) updatePayload.title = updates.title;
      if (updates.description !== undefined) updatePayload.description = updates.description || null;
      if (updates.dueDate !== undefined) updatePayload.dueDate = updates.dueDate || null;
      if (updates.startTime !== undefined) updatePayload.startTime = updates.startTime || null;
      if (updates.endTime !== undefined) updatePayload.endTime = updates.endTime || null;
      if (updates.priority !== undefined) updatePayload.priority = updates.priority;
      if (updates.color !== undefined) updatePayload.color = updates.color;
      if (updates.category !== undefined) updatePayload.category = updates.category || null;
      if (updates.project !== undefined) updatePayload.project = updates.project || null;
      if (updates.status !== undefined) {
        updatePayload.status = updates.status;
        if (updates.status === "completed") {
          updatePayload.completedAt = new Date().toISOString();
        } else {
          updatePayload.completedAt = null;
        }
      }
      if (updates.subtasks !== undefined) {
        updatePayload.subtasks = updates.subtasks ? JSON.stringify(updates.subtasks) : null;
      }

      const doc = await databases.updateDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId,
        updatePayload
      );

      return documentToTask(doc);
    } catch (error) {
      console.error("Error updating task:", error);
      throw new Error("Failed to update task");
    }
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskComplete(taskId: string): Promise<CalendarTask> {
    try {
      // First get the current task
      const currentTask = await databases.getDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId
      );

      const newStatus = currentTask.status === "completed" ? "todo" : "completed";

      const doc = await databases.updateDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId,
        {
          status: newStatus,
          completedAt: newStatus === "completed" ? new Date().toISOString() : null,
        }
      );

      return documentToTask(doc);
    } catch (error) {
      console.error("Error toggling task:", error);
      throw new Error("Failed to toggle task");
    }
  },

  /**
   * Soft delete - move task to trash
   */
  async moveToTrash(taskId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId,
        {
          deletedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Error moving task to trash:", error);
      throw new Error("Failed to move task to trash");
    }
  },

  /**
   * Restore task from trash
   */
  async restoreFromTrash(taskId: string): Promise<CalendarTask> {
    try {
      const doc = await databases.updateDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId,
        {
          deletedAt: null,
        }
      );

      return documentToTask(doc);
    } catch (error) {
      console.error("Error restoring task:", error);
      throw new Error("Failed to restore task");
    }
  },

  /**
   * Permanently delete a task
   */
  async permanentlyDelete(taskId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId
      );
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task");
    }
  },

  /**
   * Get all trashed tasks
   */
  async getTrashTasks(userId: string): Promise<CalendarTask[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.isNotNull("deletedAt"),
          Query.orderDesc("deletedAt"),
          Query.limit(100),
        ]
      );

      return response.documents.map(doc => ({
        ...documentToTask(doc),
        deletedAt: doc.deletedAt,
      } as CalendarTask & { deletedAt: string }));
    } catch (error) {
      console.error("Error fetching trash:", error);
      throw new Error("Failed to fetch trash");
    }
  },

  /**
   * Clear all completed tasks (move to trash)
   */
  async clearCompleted(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.equal("status", "completed"),
          Query.isNull("deletedAt"),
        ]
      );

      // Move all completed tasks to trash
      await Promise.all(
        response.documents.map((doc) =>
          databases.updateDocument(
            DATABASE_ID,
            TASKS_COLLECTION_ID,
            doc.$id,
            { deletedAt: new Date().toISOString() }
          )
        )
      );
    } catch (error) {
      console.error("Error clearing completed:", error);
      throw new Error("Failed to clear completed tasks");
    }
  },

  /**
   * Empty trash - permanently delete all trashed tasks
   */
  async emptyTrash(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.isNotNull("deletedAt"),
        ]
      );

      await Promise.all(
        response.documents.map((doc) =>
          databases.deleteDocument(
            DATABASE_ID,
            TASKS_COLLECTION_ID,
            doc.$id
          )
        )
      );
    } catch (error) {
      console.error("Error emptying trash:", error);
      throw new Error("Failed to empty trash");
    }
  },

  /**
   * Restore all tasks from trash
   */
  async restoreAllFromTrash(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.isNotNull("deletedAt"),
        ]
      );

      await Promise.all(
        response.documents.map((doc) =>
          databases.updateDocument(
            DATABASE_ID,
            TASKS_COLLECTION_ID,
            doc.$id,
            { deletedAt: null }
          )
        )
      );
    } catch (error) {
      console.error("Error restoring all:", error);
      throw new Error("Failed to restore all tasks");
    }
  },
};
