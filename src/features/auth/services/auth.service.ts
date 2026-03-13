import { account, databases, ID, Query } from "@/config/appwrite";
import { OAuthProvider, Permission, Role } from "appwrite";
import { storageService } from "@/shared/services/storage.service";
import { logger } from "@/shared/lib/logger";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROFILES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || "profiles";
const PREFERENCES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_PREFERENCES_COLLECTION_ID || "user_preferences";
const TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID || "tasks";

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
          onboardingCompleted: false,
        },
        userPermissions
      );
    } catch (err) {
      logger.error("Failed to create profile document", { error: err });
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
          focusModeDefault: false,
        },
        userPermissions
      );
    } catch (err) {
      logger.error("Failed to create user preferences document", { error: err });
    }

    return user;
  },

  async signIn(email: string, password: string) {
    return await account.createEmailPasswordSession(email, password);
  },

  async logout() {
    return await account.deleteSession("current");
  },

  loginWithGoogle() {
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/inbox`,
      `${window.location.origin}/auth/sign-in`
    );
  },

  loginWithDiscord() {
    account.createOAuth2Session(
      OAuthProvider.Discord,
      `${window.location.origin}/inbox`,
      `${window.location.origin}/auth/sign-in`
    );
  },

  async ensureUserDocs(userId: string, userName?: string) {
    const userPermissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

    // Check if profile already exists
    try {
      const existing = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.limit(1),
      ]);
      if (existing.total > 0) {
        // Profile exists — but check if Discord identity needs syncing
        await this.syncDiscordIdentity(userId);
        return;
      }
    } catch {
      // Collection may not exist, try creating anyway
    }

    // Try to extract Discord user ID from OAuth identities
    let discordUserId: string | null = null;
    try {
      const identities = await account.listIdentities();
      const discordIdentity = identities.identities.find(
        (i) => i.provider === "discord"
      );
      if (discordIdentity) {
        discordUserId = discordIdentity.providerUid;
      }
    } catch {
      // Identities API may not be available
    }

    // Create profile document
    try {
      await databases.createDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          displayName: userName || null,
          avatarUrl: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
          defaultProjectId: null,
          weekStartsOn: 1,
          defaultPriority: 2,
          onboardingCompleted: false,
        },
        userPermissions
      );
    } catch (err) {
      logger.error("Failed to create profile document for OAuth user", { error: err });
    }

    // Create user_preferences document
    try {
      await databases.createDocument(
        DATABASE_ID,
        PREFERENCES_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          emailEnabled: false,
          discordEnabled: !!discordUserId,
          discordUserId: discordUserId || null,
          dailySummaryEnabled: false,
          dailySummaryTime: "09:00",
          defaultReminderBefore: "1h",
          focusModeDefault: false,
        },
        userPermissions
      );
    } catch (err) {
      logger.error("Failed to create preferences document for OAuth user", { error: err });
    }
  },

  async syncDiscordIdentity(userId: string) {
    try {
      // Check if Discord identity exists but isn't saved in preferences yet
      const identities = await account.listIdentities();
      const discordIdentity = identities.identities.find(
        (i) => i.provider === "discord"
      );
      if (!discordIdentity) return;

      const prefs = await databases.listDocuments(DATABASE_ID, PREFERENCES_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.limit(1),
      ]);
      if (prefs.total === 0) return;

      const prefDoc = prefs.documents[0];
      // Only update if discordUserId is not already set
      if (!prefDoc.discordUserId) {
        await databases.updateDocument(DATABASE_ID, PREFERENCES_COLLECTION_ID, prefDoc.$id, {
          discordUserId: discordIdentity.providerUid,
          discordEnabled: true,
        });
      }
    } catch {
      // Non-critical, fail silently
    }
  },

  async deleteAccount(userId: string) {
    // 1. Delete avatar from storage
    try {
      const prefs = await account.getPrefs();
      if (prefs.avatarFileId) {
        try { await storageService.deleteTaskAttachment(prefs.avatarFileId); } catch { /* may be gone */ }
      }
    } catch { /* prefs may not exist */ }

    // 2. Delete task attachment files from storage
    try {
      let offset = 0;
      while (true) {
        const tasks = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
          Query.equal("userId", userId),
          Query.isNotNull("attachments"),
          Query.limit(100),
          Query.offset(offset),
        ]);
        if (tasks.documents.length === 0) break;
        for (const doc of tasks.documents) {
          try {
            const attachments = JSON.parse(doc.attachments);
            if (Array.isArray(attachments)) {
              for (const att of attachments) {
                try { await storageService.deleteTaskAttachment(att.fileId || att.id); } catch { /* skip */ }
              }
            }
          } catch { /* parse error, skip */ }
        }
        offset += tasks.documents.length;
      }
    } catch { /* tasks collection may not exist */ }

    // 3. Delete all user documents with paginated loop
    const collections = [
      TASKS_COLLECTION_ID,
      import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID || "projects",
      import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID || "categories",
      import.meta.env.VITE_APPWRITE_SUBTASKS_COLLECTION_ID || "subtasks",
      import.meta.env.VITE_APPWRITE_TASK_COMMENTS_COLLECTION_ID || "task_comments",
      import.meta.env.VITE_APPWRITE_TASK_TEMPLATES_COLLECTION_ID || "task_templates",
      PROFILES_COLLECTION_ID,
      PREFERENCES_COLLECTION_ID,
    ];

    for (const collectionId of collections) {
      try {
        while (true) {
          const docs = await databases.listDocuments(DATABASE_ID, collectionId, [
            Query.equal("userId", userId),
            Query.limit(100),
          ]);
          if (docs.documents.length === 0) break;
          await Promise.all(
            docs.documents.map((doc) => databases.deleteDocument(DATABASE_ID, collectionId, doc.$id))
          );
        }
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
