import { account, databases, ID, Query } from "@/config/appwrite";
import { Permission, Role } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROFILES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || "profiles";
const PREFERENCES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_PREFERENCES_COLLECTION_ID || "user_preferences";

export const authService = {
  async getCurrentUser() {
    try {
      return await account.get();
    } catch {
      return null;
    }
  },

  async signUp(email: string, password: string, name?: string) {
    const user = await account.create(ID.unique(), email, password, name);

    // Auto-login to get session for creating documents
    await account.createEmailPasswordSession(email, password);

    const userPermissions = [
      Permission.read(Role.user(user.$id)),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ];

    // Create profile document
    try {
      await databases.createDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          displayName: name || null,
          avatarUrl: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
          defaultProjectId: null,
          weekStartsOn: 1,
          defaultPriority: 2,
        },
        userPermissions
      );
    } catch (err) {
      console.error("Failed to create profile document:", err);
    }

    // Create user_preferences document
    try {
      await databases.createDocument(
        DATABASE_ID,
        PREFERENCES_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          emailEnabled: false,
          discordEnabled: false,
          dailySummaryEnabled: false,
          dailySummaryTime: "09:00",
          defaultReminderBefore: "1h",
        },
        userPermissions
      );
    } catch (err) {
      console.error("Failed to create user preferences document:", err);
    }

    return user;
  },

  async signIn(email: string, password: string) {
    return await account.createEmailPasswordSession(email, password);
  },

  async logout() {
    return await account.deleteSession("current");
  },

  async deleteAccount(userId: string) {
    // Delete all user documents first
    const collections = [
      import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID || "tasks",
      import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID || "projects",
      import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID || "categories",
      import.meta.env.VITE_APPWRITE_SUBTASKS_COLLECTION_ID || "subtasks",
      PROFILES_COLLECTION_ID,
      PREFERENCES_COLLECTION_ID,
    ];

    for (const collectionId of collections) {
      try {
        const docs = await databases.listDocuments(DATABASE_ID, collectionId, [
          Query.equal("userId", userId),
          Query.limit(500),
        ]);
        await Promise.all(
          docs.documents.map((doc) => databases.deleteDocument(DATABASE_ID, collectionId, doc.$id))
        );
      } catch {
        // Collection may not exist or no docs, continue
      }
    }

    // Delete the Appwrite Auth identity
    // Note: account.updateStatus() disables the account from client-side
    // Full deletion requires server-side API key (users.delete)
    // For now, we disable the account and clear the session
    await account.updateStatus();
  },
};
