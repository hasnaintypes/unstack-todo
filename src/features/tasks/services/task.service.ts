import { databases, ID, Query } from "@/config/appwrite";
import { Permission, Role, type Models } from "appwrite";
import { processInChunks } from "@/shared/lib/utils";
import { logger } from "@/shared/lib/logger";
import type {
  CalendarTask,
  Subtask,
  Attachment,
  TaskStatus,
  TaskPriority,
  ReminderBefore,
  Recurrence,
} from "@/features/tasks/types/task.types";
// Note: color is no longer stored — it's derived from priority in the UI.

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
const TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID || "tasks";
const COMMENTS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_TASK_COMMENTS_COLLECTION_ID || "task_comments";

/**
 * Convert CalendarTask to Appwrite document format
 */
function taskToDocument(task: Omit<CalendarTask, "id">, userId: string) {
  const doc: Record<string, unknown> = {
    title: task.title,
    description: task.description || null,
    dueDate: task.dueDate || null,
    startTime: task.startTime || null,
    endTime: task.endTime || null,
    priority: task.priority || 2,
    categoryId: task.category || null,
    projectId: task.project || null,
    status: task.status || "todo",
    userId,
    subtasks: task.subtasks ? JSON.stringify(task.subtasks) : null,
    completedAt: task.status === "completed" ? new Date().toISOString() : null,
    reminderEnabled: task.reminderEnabled ?? false,
    reminderBefore: task.reminderBefore || null,
  };
  if (task.tags && task.tags.length > 0) doc.tags = JSON.stringify(task.tags);
  // Only include these if they have values — avoids "Unknown attribute" errors
  // if the collection hasn't been updated with these fields yet
  if (task.recurrence) doc.recurrence = task.recurrence;
  if (task.attachments && task.attachments.length > 0)
    doc.attachments = JSON.stringify(task.attachments);
  return doc;
}

function safeParseArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function safeParseSubtasks(raw: string): Subtask[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: unknown) =>
      typeof item === "string" ? { title: item, completed: false } : (item as Subtask)
    );
  } catch {
    return [];
  }
}

function safeParseAttachments(raw: string): Attachment[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Attachment[];
  } catch {
    return [];
  }
}

/**
 * Convert Appwrite document to CalendarTask
 */
function documentToTask(doc: Models.DefaultDocument): CalendarTask {
  return {
    id: doc.$id,
    title: doc.title,
    description: doc.description || undefined,
    dueDate: doc.dueDate || "",
    startTime: doc.startTime || undefined,
    endTime: doc.endTime || undefined,
    priority: (doc.priority as TaskPriority) || 2,
    category: doc.categoryId || undefined,
    project: doc.projectId || undefined,
    status: (doc.status as TaskStatus) || "todo",
    subtasks: doc.subtasks ? safeParseSubtasks(doc.subtasks) : undefined,
    reminderEnabled: doc.reminderEnabled ?? false,
    reminderBefore: (doc.reminderBefore as ReminderBefore) || undefined,
    tags: doc.tags ? safeParseArray(doc.tags) : undefined,
    recurrence: (doc.recurrence as Recurrence) || null,
    attachments: doc.attachments ? safeParseAttachments(doc.attachments) : undefined,
  };
}

export const taskService = {
  /**
   * Get all tasks for the current user (excluding deleted)
   */
  async getAllTasks(userId: string): Promise<CalendarTask[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.isNull("deletedAt"),
        Query.orderDesc("$createdAt"),
        Query.limit(1000), // Adjust based on your needs
      ]);

      return response.documents.map(documentToTask);
    } catch (error) {
      logger.error("Error fetching tasks", { error });
      throw new Error("Failed to fetch tasks");
    }
  },

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<CalendarTask> {
    try {
      const doc = await databases.getDocument<Models.DefaultDocument>(DATABASE_ID, TASKS_COLLECTION_ID, taskId);

      return documentToTask(doc);
    } catch (error) {
      logger.error("Error fetching task", { error });
      throw new Error("Failed to fetch task");
    }
  },

  /**
   * Create a new task
   */
  async createTask(task: Omit<CalendarTask, "id">, userId: string): Promise<CalendarTask> {
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
      logger.error("Error creating task", { error });
      throw new Error("Failed to create task");
    }
  },

  /**
   * Create multiple tasks in parallel (batch)
   */
  async createTasksBatch(
    tasks: Omit<CalendarTask, "id">[],
    userId: string
  ): Promise<CalendarTask[]> {
    try {
      const docs: Models.DefaultDocument[] = [];
      await processInChunks(tasks, async (task) => {
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
        docs.push(doc);
      });
      return docs.map(documentToTask);
    } catch (error) {
      logger.error("Error creating tasks batch", { error });
      throw new Error("Failed to create tasks");
    }
  },

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updates: Partial<CalendarTask>): Promise<CalendarTask> {
    try {
      // Prepare the update payload
      const updatePayload: Record<string, unknown> = {};

      if (updates.title !== undefined) updatePayload.title = updates.title;
      if (updates.description !== undefined)
        updatePayload.description = updates.description || null;
      if (updates.dueDate !== undefined) updatePayload.dueDate = updates.dueDate || null;
      if (updates.startTime !== undefined) updatePayload.startTime = updates.startTime || null;
      if (updates.endTime !== undefined) updatePayload.endTime = updates.endTime || null;
      if (updates.priority !== undefined) updatePayload.priority = updates.priority;
      if (updates.category !== undefined) updatePayload.categoryId = updates.category || null;
      if (updates.project !== undefined) updatePayload.projectId = updates.project || null;
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
      if (updates.reminderEnabled !== undefined) {
        updatePayload.reminderEnabled = updates.reminderEnabled;
      }
      if (updates.reminderBefore !== undefined) {
        updatePayload.reminderBefore = updates.reminderBefore || null;
      }
      if (updates.tags !== undefined) {
        updatePayload.tags =
          updates.tags && updates.tags.length > 0 ? JSON.stringify(updates.tags) : null;
      }
      if (updates.recurrence !== undefined && updates.recurrence) {
        updatePayload.recurrence = updates.recurrence;
      }
      if (updates.attachments !== undefined) {
        updatePayload.attachments =
          updates.attachments && updates.attachments.length > 0
            ? JSON.stringify(updates.attachments)
            : null;
      }

      const doc = await databases.updateDocument<Models.DefaultDocument>(
        DATABASE_ID,
        TASKS_COLLECTION_ID,
        taskId,
        updatePayload
      );

      return documentToTask(doc);
    } catch (error) {
      logger.error("Error updating task", { error });
      throw new Error("Failed to update task");
    }
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskComplete(taskId: string): Promise<CalendarTask> {
    try {
      // First get the current task
      const currentTask = await databases.getDocument<Models.DefaultDocument>(DATABASE_ID, TASKS_COLLECTION_ID, taskId);

      const newStatus = currentTask.status === "completed" ? "todo" : "completed";

      const doc = await databases.updateDocument<Models.DefaultDocument>(DATABASE_ID, TASKS_COLLECTION_ID, taskId, {
        status: newStatus,
        completedAt: newStatus === "completed" ? new Date().toISOString() : null,
      });

      return documentToTask(doc);
    } catch (error) {
      logger.error("Error toggling task", { error });
      throw new Error("Failed to toggle task");
    }
  },

  /**
   * Soft delete - move task to trash
   */
  async moveToTrash(taskId: string): Promise<void> {
    try {
      await databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, taskId, {
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error moving task to trash", { error });
      throw new Error("Failed to move task to trash");
    }
  },

  /**
   * Restore task from trash
   */
  async restoreFromTrash(taskId: string): Promise<CalendarTask> {
    try {
      const doc = await databases.updateDocument<Models.DefaultDocument>(DATABASE_ID, TASKS_COLLECTION_ID, taskId, {
        deletedAt: null,
      });

      return documentToTask(doc);
    } catch (error) {
      logger.error("Error restoring task", { error });
      throw new Error("Failed to restore task");
    }
  },

  /**
   * Delete all comments associated with a task
   */
  async deleteTaskComments(taskId: string): Promise<void> {
    try {
      const comments = await databases.listDocuments(DATABASE_ID, COMMENTS_COLLECTION_ID, [
        Query.equal("taskId", taskId),
        Query.limit(500),
      ]);
      await processInChunks(comments.documents, (doc) =>
        databases.deleteDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, doc.$id)
      );
    } catch {
      // Comments collection may not exist or no comments, continue
    }
  },

  /**
   * Permanently delete a task and its associated comments
   */
  async permanentlyDelete(taskId: string): Promise<void> {
    try {
      await this.deleteTaskComments(taskId);
      await databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, taskId);
    } catch (error) {
      logger.error("Error deleting task", { error });
      throw new Error("Failed to delete task");
    }
  },

  /**
   * Get all trashed tasks
   */
  async getTrashTasks(userId: string): Promise<CalendarTask[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.isNotNull("deletedAt"),
        Query.orderDesc("deletedAt"),
        Query.limit(100),
      ]);

      return response.documents.map(
        (doc) =>
          ({
            ...documentToTask(doc),
            deletedAt: doc.deletedAt,
          }) as CalendarTask & { deletedAt: string }
      );
    } catch (error) {
      logger.error("Error fetching trash", { error });
      throw new Error("Failed to fetch trash");
    }
  },

  /**
   * Clear all completed tasks (move to trash)
   */
  async clearCompleted(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.equal("status", "completed"),
        Query.isNull("deletedAt"),
        Query.limit(500),
      ]);

      await processInChunks(response.documents, (doc) =>
        databases.updateDocument<Models.DefaultDocument>(DATABASE_ID, TASKS_COLLECTION_ID, doc.$id, {
          deletedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      logger.error("Error clearing completed", { error });
      throw new Error("Failed to clear completed tasks");
    }
  },

  /**
   * Empty trash - permanently delete all trashed tasks and their comments
   */
  async emptyTrash(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.isNotNull("deletedAt"),
        Query.limit(500),
      ]);

      await processInChunks(response.documents, async (doc) => {
        await this.deleteTaskComments(doc.$id);
        await databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, doc.$id);
      });
    } catch (error) {
      logger.error("Error emptying trash", { error });
      throw new Error("Failed to empty trash");
    }
  },

  /**
   * Create next occurrence of a recurring task
   */
  async createNextOccurrence(task: CalendarTask, userId: string): Promise<CalendarTask> {
    const getNextDate = (dateStr: string, recurrence: Recurrence): string => {
      const date = new Date(dateStr);
      switch (recurrence) {
        case "daily":
          date.setDate(date.getDate() + 1);
          break;
        case "weekly":
          date.setDate(date.getDate() + 7);
          break;
        case "monthly":
          date.setMonth(date.getMonth() + 1);
          break;
        case "weekdays": {
          do {
            date.setDate(date.getDate() + 1);
          } while (date.getDay() === 0 || date.getDay() === 6);
          break;
        }
      }
      return date.toISOString().split("T")[0];
    };

    const nextDueDate = task.dueDate
      ? getNextDate(task.dueDate, task.recurrence!)
      : new Date().toISOString().split("T")[0];

    return this.createTask(
      {
        title: task.title,
        description: task.description,
        dueDate: nextDueDate,
        startTime: task.startTime,
        endTime: task.endTime,
        priority: task.priority,
        category: task.category,
        tags: task.tags,
        project: task.project,
        status: "todo",
        subtasks: task.subtasks?.map((s) => ({ ...s, completed: false })),
        reminderEnabled: task.reminderEnabled,
        reminderBefore: task.reminderBefore,
        recurrence: task.recurrence,
      },
      userId
    );
  },

  /**
   * Export all tasks for the user as JSON
   */
  async exportTasksJSON(userId: string): Promise<string> {
    const tasks = await this.getAllTasks(userId);
    return JSON.stringify(tasks, null, 2);
  },

  /**
   * Export all tasks for the user as CSV
   */
  async exportTasksCSV(userId: string): Promise<string> {
    const tasks = await this.getAllTasks(userId);
    const headers = [
      "title",
      "description",
      "dueDate",
      "startTime",
      "endTime",
      "priority",
      "status",
      "category",
      "project",
      "tags",
      "recurrence",
      "reminderEnabled",
      "reminderBefore",
    ];
    const csvRows = [headers.join(",")];
    for (const task of tasks) {
      const row = headers.map((h) => {
        const val = task[h as keyof CalendarTask];
        let str: string;
        if (val == null) {
          str = "";
        } else if (Array.isArray(val)) {
          str = val.join("; ");
        } else {
          str = String(val);
        }
        return `"${str.replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(","));
    }
    return csvRows.join("\n");
  },

  /**
   * Import tasks from JSON array
   */
  async importTasks(
    tasksData: Omit<CalendarTask, "id">[],
    userId: string
  ): Promise<CalendarTask[]> {
    const created: CalendarTask[] = [];
    for (const taskData of tasksData) {
      const task = await this.createTask(taskData, userId);
      created.push(task);
    }
    return created;
  },

  /**
   * Restore all tasks from trash
   */
  async restoreAllFromTrash(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.isNotNull("deletedAt"),
        Query.limit(500),
      ]);

      await processInChunks(response.documents, (doc) =>
        databases.updateDocument<Models.DefaultDocument>(DATABASE_ID, TASKS_COLLECTION_ID, doc.$id, { deletedAt: null })
      );
    } catch (error) {
      logger.error("Error restoring all", { error });
      throw new Error("Failed to restore all tasks");
    }
  },
};
