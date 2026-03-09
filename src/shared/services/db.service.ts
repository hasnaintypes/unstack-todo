import { databases, ID } from "@/config/appwrite";
import type { DatabaseQuery, DocumentPayload } from "@/shared/types/database.types";

export const dbService = {
  async listDocuments(databaseId: string, collectionId: string, queries: DatabaseQuery[] = []) {
    return await databases.listDocuments(databaseId, collectionId, queries);
  },

  async getDocument(databaseId: string, collectionId: string, documentId: string) {
    return await databases.getDocument(databaseId, collectionId, documentId);
  },

  async createDocument(databaseId: string, collectionId: string, data: DocumentPayload) {
    return await databases.createDocument(databaseId, collectionId, ID.unique(), data);
  },

  async updateDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: DocumentPayload
  ) {
    return await databases.updateDocument(databaseId, collectionId, documentId, data);
  },

  async deleteDocument(databaseId: string, collectionId: string, documentId: string) {
    return await databases.deleteDocument(databaseId, collectionId, documentId);
  },
};
