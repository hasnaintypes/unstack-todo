import { databases, ID, Query } from "@/config/appwrite";
import { Permission, Role, type Models } from "appwrite";
import type { UserReminderPreferences } from "../types/reminder.types";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PREFERENCES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_PREFERENCES_COLLECTION_ID ||
  import.meta.env.VITE_APPWRITE_USER_PREFERENCES_COLLECTION_ID ||
  "user_preferences";

const DEFAULT_PREFERENCES: Omit<UserReminderPreferences, "id" | "userId"> = {
  emailEnabled: false,
  discordEnabled: false,
  dailySummaryEnabled: false,
  dailySummaryTime: "09:00",
  defaultReminderBefore: "1h",
};

function documentToPreferences(doc: Models.Document): UserReminderPreferences {
  return {
    id: doc.$id,
    userId: doc.userId,
    emailEnabled: doc.emailEnabled ?? false,
    discordEnabled: doc.discordEnabled ?? false,
    discordUserId: doc.discordUserId || undefined,
    dailySummaryEnabled: doc.dailySummaryEnabled ?? false,
    dailySummaryTime: doc.dailySummaryTime || "09:00",
    defaultReminderBefore: doc.defaultReminderBefore || "1h",
  };
}

export const reminderService = {
  async getPreferences(userId: string): Promise<UserReminderPreferences> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, PREFERENCES_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.limit(1),
      ]);

      if (response.documents.length > 0) {
        return documentToPreferences(response.documents[0]);
      }

      // Create default preferences
      const doc = await databases.createDocument(
        DATABASE_ID,
        PREFERENCES_COLLECTION_ID,
        ID.unique(),
        { userId, ...DEFAULT_PREFERENCES },
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );

      return documentToPreferences(doc);
    } catch (error) {
      console.error("Error fetching reminder preferences:", error);
      return { userId, ...DEFAULT_PREFERENCES };
    }
  },

  async updatePreferences(
    preferencesId: string,
    updates: Partial<Omit<UserReminderPreferences, "id" | "userId">>
  ): Promise<UserReminderPreferences> {
    try {
      const doc = await databases.updateDocument(
        DATABASE_ID,
        PREFERENCES_COLLECTION_ID,
        preferencesId,
        updates
      );
      return documentToPreferences(doc);
    } catch (error) {
      console.error("Error updating reminder preferences:", error);
      throw new Error("Failed to update preferences");
    }
  },
};
