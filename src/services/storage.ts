import { storage, ID } from "@/lib/appwrite";

export const storageService = {
  async uploadFile(bucketId: string, file: File) {
    return await storage.createFile(bucketId, ID.unique(), file);
  },

  async getFilePreview(bucketId: string, fileId: string) {
    return storage.getFilePreview(bucketId, fileId);
  },

  async getFileView(bucketId: string, fileId: string) {
    return storage.getFileView(bucketId, fileId);
  },

  async deleteFile(bucketId: string, fileId: string) {
    return await storage.deleteFile(bucketId, fileId);
  },
};
