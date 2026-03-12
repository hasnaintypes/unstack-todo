import { databases, Query } from "@/config/appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROFILES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || "profiles";

export const onboardingService = {
  async getProfile(userId: string) {
    const response = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    return response.documents[0] || null;
  },

  async completeOnboarding(documentId: string) {
    await databases.updateDocument(DATABASE_ID, PROFILES_COLLECTION_ID, documentId, {
      onboardingCompleted: true,
    });
  },
};
