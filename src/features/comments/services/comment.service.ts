import { databases, ID, Query } from "@/config/appwrite";
import { Permission, Role, type Models } from "appwrite";
import type { TaskComment } from "../types/comment.types";
import { logger } from "@/shared/lib/logger";


const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COMMENTS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_TASK_COMMENTS_COLLECTION_ID || "task_comments";

function documentToComment(doc: Models.DefaultDocument): TaskComment {
  return {
    id: doc.$id,
    taskId: doc.taskId,
    userId: doc.userId,
    content: doc.content,
    createdAt: doc.$createdAt,
  };
}

export const commentService = {
  async getComments(taskId: string): Promise<TaskComment[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COMMENTS_COLLECTION_ID, [
        Query.equal("taskId", taskId),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]);
      return response.documents.map(documentToComment);
    } catch (error) {
      logger.error("Error fetching comments", { error });
      return [];
    }
  },

  async addComment(taskId: string, userId: string, content: string): Promise<TaskComment> {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      ID.unique(),
      { taskId, userId, content },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return documentToComment(doc);
  },

  async updateComment(commentId: string, content: string): Promise<TaskComment> {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      commentId,
      { content }
    );
    return documentToComment(doc);
  },

  async deleteComment(commentId: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, commentId);
  },
};
