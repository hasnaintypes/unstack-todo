import { Client, Databases, Query, Messaging } from "node-appwrite";

/**
 * Check Reminders — CRON Function (every 15 minutes)
 *
 * Queries tasks with reminders enabled and upcoming due dates.
 * Sends email via Appwrite Messaging and Discord DM via bot webhook.
 *
 * Environment variables:
 * - APPWRITE_ENDPOINT
 * - APPWRITE_PROJECT_ID
 * - APPWRITE_API_KEY
 * - APPWRITE_DATABASE_ID
 * - TASKS_COLLECTION_ID
 * - PREFERENCES_COLLECTION_ID
 * - DISCORD_BOT_WEBHOOK_URL (optional)
 */

const REMINDER_WINDOWS = {
  "1d": 24 * 60, // minutes
  "1h": 60,
  "30m": 30,
  "on_due": 0,
};

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

    // Get tasks with reminders enabled and a due date
    const tasksResponse = await databases.listDocuments(
      DATABASE_ID,
      TASKS_COLLECTION_ID,
      [
        Query.equal("reminderEnabled", true),
        Query.isNotNull("dueDate"),
        Query.isNull("deletedAt"),
        Query.notEqual("status", "completed"),
        Query.limit(100),
      ]
    );

    log(`Found ${tasksResponse.documents.length} tasks with reminders`);

    let sentCount = 0;

    for (const task of tasksResponse.documents) {
      const dueDate = new Date(task.dueDate);
      const reminderBefore = task.reminderBefore || "1h";
      const windowMinutes = REMINDER_WINDOWS[reminderBefore] ?? 60;

      // Calculate when reminder should fire
      const reminderTime = new Date(dueDate.getTime() - windowMinutes * 60 * 1000);

      // Check if we're within the 15-minute CRON window of the reminder time
      const diffMinutes = (reminderTime.getTime() - now.getTime()) / (1000 * 60);

      if (diffMinutes >= -15 && diffMinutes <= 0) {
        // Time to send reminder!
        try {
          // Get user preferences
          const prefsResponse = await databases.listDocuments(
            DATABASE_ID,
            PREFERENCES_COLLECTION_ID,
            [Query.equal("userId", task.userId), Query.limit(1)]
          );

          const prefs = prefsResponse.documents[0];

          if (prefs?.emailEnabled) {
            // Send email via Appwrite Messaging
            try {
              await messaging.createEmail(
                `reminder-${task.$id}-${Date.now()}`,
                `Task Reminder: ${task.title}`,
                `<h2>Reminder</h2><p>Your task "<strong>${task.title}</strong>" is due ${reminderBefore === "on_due" ? "now" : `in ${reminderBefore}`}.</p>`,
                [], // topics
                [task.userId], // users
                [], // targets
                [], // cc
                [], // bcc
                false, // draft
                true // html
              );
              log(`Email sent for task: ${task.title}`);
            } catch (emailErr) {
              error(`Failed to send email for task ${task.$id}: ${emailErr.message}`);
            }
          }

          if (prefs?.discordEnabled && prefs?.discordUserId && process.env.DISCORD_BOT_WEBHOOK_URL) {
            // Send Discord DM via webhook
            try {
              await fetch(process.env.DISCORD_BOT_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: prefs.discordUserId,
                  message: `**Task Reminder** \n${task.title}\nDue: ${task.dueDate}`,
                }),
              });
              log(`Discord notification sent for task: ${task.title}`);
            } catch (discordErr) {
              error(`Failed to send Discord notification: ${discordErr.message}`);
            }
          }

          sentCount++;
        } catch (prefErr) {
          error(`Failed to process task ${task.$id}: ${prefErr.message}`);
        }
      }
    }

    return res.json({ success: true, remindersChecked: tasksResponse.documents.length, remindersSent: sentCount });
  } catch (err) {
    error(`Check reminders failed: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
