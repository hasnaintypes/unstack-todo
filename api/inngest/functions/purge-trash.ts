import { Client, Databases, Storage, Query } from "node-appwrite";
import { inngest } from "../client.js";

export const purgeTrash = inngest.createFunction(
  { id: "purge-trash", name: "Purge Trash (30-day auto-delete)" },
  { cron: "0 2 * * *" },
  async ({ step, logger }) => {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);
    const storage = new Storage(client);

    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const TASKS_COLLECTION_ID = process.env.TASKS_COLLECTION_ID || "tasks";
    const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || "uploads";

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString();

    let deletedCount = 0;
    let hasMore = true;

    // Phase 1: Permanently delete tasks trashed >30 days ago
    while (hasMore) {
      const batch = await step.run(`query-trashed-batch-${deletedCount}`, async () => {
        const response = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
          Query.isNotNull("deletedAt"),
          Query.lessThan("deletedAt", cutoff),
          Query.limit(100),
        ]);
        return response.documents;
      });

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      for (const task of batch) {
        await step.run(`delete-task-${task.$id}`, async () => {
          // Delete attachments from storage
          if (task.attachments) {
            try {
              const attachments = JSON.parse(task.attachments);
              if (Array.isArray(attachments)) {
                for (const att of attachments) {
                  if (att?.fileId) {
                    try {
                      await storage.deleteFile(BUCKET_ID, att.fileId);
                    } catch {
                      // File may already be deleted
                    }
                  }
                }
              }
            } catch {
              // Invalid JSON, skip attachments
            }
          }

          await databases.deleteDocument(DATABASE_ID, TASKS_COLLECTION_ID, task.$id);
        });

        deletedCount++;
      }
    }

    // Phase 2: Auto-archive completed tasks >30 days for users with autoArchiveEnabled
    const PREFERENCES_COLLECTION_ID = process.env.PREFERENCES_COLLECTION_ID || "user_preferences";

    const enabledUsers = await step.run("query-auto-archive-users", async () => {
      const response = await databases.listDocuments(DATABASE_ID, PREFERENCES_COLLECTION_ID, [
        Query.equal("autoArchiveEnabled", true),
        Query.limit(500),
      ]);
      return response.documents.map((doc) => doc.userId as string);
    });

    let archivedCount = 0;

    for (const userId of enabledUsers) {
      let userHasMore = true;

      while (userHasMore) {
        const completedTasks = await step.run(
          `query-completed-${userId}-${archivedCount}`,
          async () => {
            const response = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
              Query.equal("userId", userId),
              Query.equal("status", "completed"),
              Query.isNull("deletedAt"),
              Query.isNotNull("completedAt"),
              Query.lessThan("completedAt", cutoff),
              Query.limit(100),
            ]);
            return response.documents;
          }
        );

        if (completedTasks.length === 0) {
          userHasMore = false;
          break;
        }

        for (const task of completedTasks) {
          await step.run(`archive-task-${task.$id}`, async () => {
            await databases.updateDocument(DATABASE_ID, TASKS_COLLECTION_ID, task.$id, {
              deletedAt: new Date().toISOString(),
            });
          });

          archivedCount++;
        }
      }
    }

    logger.info(`Purge complete: ${deletedCount} deleted, ${archivedCount} archived`);
    return { trashedDeleted: deletedCount, completedArchived: archivedCount };
  }
);
