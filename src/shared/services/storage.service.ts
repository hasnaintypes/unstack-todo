import { storage, ID } from "@/config/appwrite";

const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || "uploads";

export const storageService = {
  async uploadFile(bucketId: string, file: File) {
    return await storage.createFile(bucketId, ID.unique(), file);
  },

  async uploadTaskAttachment(file: File) {
    return await storage.createFile(BUCKET_ID, ID.unique(), file);
  },

  getFileDownloadUrl(fileId: string) {
    return storage.getFileDownload(BUCKET_ID, fileId);
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

  async deleteTaskAttachment(fileId: string) {
    return await storage.deleteFile(BUCKET_ID, fileId);
  },
};
