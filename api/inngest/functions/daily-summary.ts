import { Client, Databases, Query, Messaging } from "node-appwrite";
import { inngest } from "../client";

interface TaskDocument {
  $id: string;
  title: string;
  priority: string;
  dueDate: string;
  userId: string;
  [key: string]: unknown;
}

export const dailySummary = inngest.createFunction(
  { id: "daily-summary", name: "Daily Task Summary" },
  { cron: "0 * * * *" },
  async ({ step, logger }) => {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);
    const messaging = new Messaging(client);

    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const TASKS_COLLECTION_ID = process.env.TASKS_COLLECTION_ID || "tasks";
    const PREFERENCES_COLLECTION_ID =
      process.env.PREFERENCES_COLLECTION_ID || "user_preferences";

    const now = new Date();
    const currentHour = now.getUTCHours().toString().padStart(2, "0");

    const matchingPrefs = await step.run("query-user-preferences", async () => {
      const prefsResponse = await databases.listDocuments(
        DATABASE_ID,
        PREFERENCES_COLLECTION_ID,
        [
          Query.equal("dailySummaryEnabled", true),
          Query.startsWith("dailySummaryTime", `${currentHour}:`),
          Query.limit(100),
        ]
      );
      return prefsResponse.documents;
    });

    logger.info(
      `Found ${matchingPrefs.length} users for daily summary at ${currentHour}:xx`
    );

    let sentCount = 0;

    for (const prefs of matchingPrefs) {
      await step.run(`send-summary-${prefs.userId}`, async () => {
        const today = now.toISOString().split("T")[0];
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const tasksResponse = await databases.listDocuments(
          DATABASE_ID,
          TASKS_COLLECTION_ID,
          [
            Query.equal("userId", prefs.userId),
            Query.isNull("deletedAt"),
            Query.notEqual("status", "completed"),
            Query.lessThanEqual("dueDate", tomorrow),
            Query.orderAsc("dueDate"),
            Query.limit(20),
          ]
        );

        if (tasksResponse.documents.length === 0) return;

        const tasks = tasksResponse.documents as unknown as TaskDocument[];
        const todayTasks = tasks.filter((t) => t.dueDate === today);
        const overdueTasks = tasks.filter((t) => t.dueDate < today);
        const tomorrowTasks = tasks.filter((t) => t.dueDate === tomorrow);

        const formatList = (items: TaskDocument[]) =>
          items.map((t) => `<li>${t.title} (Priority: ${t.priority})</li>`).join("");

        let html = `<h2>Daily Task Summary</h2>`;
        if (overdueTasks.length > 0) {
          html += `<h3 style="color: #e44232;">Overdue (${overdueTasks.length})</h3><ul>${formatList(overdueTasks)}</ul>`;
        }
        if (todayTasks.length > 0) {
          html += `<h3>Due Today (${todayTasks.length})</h3><ul>${formatList(todayTasks)}</ul>`;
        }
        if (tomorrowTasks.length > 0) {
          html += `<h3>Due Tomorrow (${tomorrowTasks.length})</h3><ul>${formatList(tomorrowTasks)}</ul>`;
        }

        if (prefs.emailEnabled) {
          await messaging.createEmail({
            messageId: `summary-${prefs.userId}-${today}`,
            subject: `Your Daily Task Summary — ${todayTasks.length} tasks due today`,
            content: html,
            users: [prefs.userId],
            html: true,
          });
          sentCount++;
          logger.info(`Summary sent to user ${prefs.userId}`);
        }
      });
    }

    return { summariesSent: sentCount };
  }
);
