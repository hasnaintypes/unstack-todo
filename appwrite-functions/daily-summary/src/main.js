import { Client, Databases, Query, Messaging } from "node-appwrite";

/**
 * Daily Summary — CRON Function (runs hourly, checks per-user time)
 *
 * Sends a daily digest of upcoming tasks to users who enabled the setting.
 *
 * Environment variables:
 * - APPWRITE_ENDPOINT
 * - APPWRITE_PROJECT_ID
 * - APPWRITE_API_KEY
 * - APPWRITE_DATABASE_ID
 * - TASKS_COLLECTION_ID
 * - PREFERENCES_COLLECTION_ID
 */

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const messaging = new Messaging(client);

  const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
  const TASKS_COLLECTION_ID = process.env.TASKS_COLLECTION_ID || "tasks";
  const PREFERENCES_COLLECTION_ID = process.env.PREFERENCES_COLLECTION_ID || "user_preferences";

  try {
    const now = new Date();
    const currentHour = now.getUTCHours().toString().padStart(2, "0");

    // Find users whose daily summary time matches the current hour
    const prefsResponse = await databases.listDocuments(
      DATABASE_ID,
      PREFERENCES_COLLECTION_ID,
      [
        Query.equal("dailySummaryEnabled", true),
        Query.startsWith("dailySummaryTime", `${currentHour}:`),
        Query.limit(100),
      ]
    );

    log(`Found ${prefsResponse.documents.length} users for daily summary at ${currentHour}:xx`);

    let sentCount = 0;

    for (const prefs of prefsResponse.documents) {
      try {
        // Get user's tasks for today and upcoming
        const today = now.toISOString().split("T")[0];
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

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

        if (tasksResponse.documents.length === 0) continue;

        const todayTasks = tasksResponse.documents.filter((t) => t.dueDate === today);
        const overdueTasks = tasksResponse.documents.filter((t) => t.dueDate < today);
        const tomorrowTasks = tasksResponse.documents.filter((t) => t.dueDate === tomorrow);

        const formatList = (tasks) =>
          tasks.map((t) => `<li>${t.title} (Priority: ${t.priority})</li>`).join("");

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
          await messaging.createEmail(
            `summary-${prefs.userId}-${today}`,
            `Your Daily Task Summary — ${todayTasks.length} tasks due today`,
            html,
            [],
            [prefs.userId],
            [],
            [],
            [],
            false,
            true
          );
          sentCount++;
        }

        log(`Summary sent to user ${prefs.userId}`);
      } catch (userErr) {
        error(`Failed to send summary to user ${prefs.userId}: ${userErr.message}`);
      }
    }

    return res.json({ success: true, summariesSent: sentCount });
  } catch (err) {
    error(`Daily summary failed: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
