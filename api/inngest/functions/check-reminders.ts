import { Client, Databases, Query, Messaging } from "node-appwrite";
import { inngest } from "../client.js";

const REMINDER_WINDOWS: Record<string, number> = {
  "1d": 24 * 60,
  "1h": 60,
  "30m": 30,
  on_due: 0,
};

export const checkReminders = inngest.createFunction(
  { id: "check-reminders", name: "Check Task Reminders" },
  { cron: "*/15 * * * *" },
  async ({ step, logger }) => {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);
    const messaging = new Messaging(client);

    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const TASKS_COLLECTION_ID = process.env.TASKS_COLLECTION_ID || "tasks";
    const PREFERENCES_COLLECTION_ID = process.env.PREFERENCES_COLLECTION_ID || "user_preferences";

    const tasksResponse = await step.run("query-reminder-tasks", async () => {
      const response = await databases.listDocuments(DATABASE_ID, TASKS_COLLECTION_ID, [
        Query.equal("reminderEnabled", true),
        Query.isNotNull("dueDate"),
        Query.isNull("deletedAt"),
        Query.notEqual("status", "completed"),
        Query.limit(100),
      ]);
      return response.documents;
    });

    logger.info(`Found ${tasksResponse.length} tasks with reminders`);

    let sentCount = 0;
    const now = new Date();

    for (const task of tasksResponse) {
      const dueDate = new Date(task.dueDate);
      const reminderBefore: string = task.reminderBefore || "1h";
      const windowMinutes = REMINDER_WINDOWS[reminderBefore] ?? 60;

      const reminderTime = new Date(dueDate.getTime() - windowMinutes * 60 * 1000);
      const diffMinutes = (reminderTime.getTime() - now.getTime()) / (1000 * 60);

      if (diffMinutes >= -15 && diffMinutes <= 0) {
        await step.run(`send-reminder-${task.$id}`, async () => {
          const prefsResponse = await databases.listDocuments(
            DATABASE_ID,
            PREFERENCES_COLLECTION_ID,
            [Query.equal("userId", task.userId), Query.limit(1)]
          );

          const prefs = prefsResponse.documents[0];

          if (prefs?.emailEnabled) {
            try {
              await messaging.createEmail({
                messageId: `reminder-${task.$id}-${Date.now()}`,
                subject: `Task Reminder: ${task.title}`,
                content: `<h2>Reminder</h2><p>Your task "<strong>${task.title}</strong>" is due ${reminderBefore === "on_due" ? "now" : `in ${reminderBefore}`}.</p>`,
                users: [task.userId],
                html: true,
              });
              logger.info(`Email sent for task: ${task.title}`);
            } catch (emailErr) {
              logger.error(
                `Failed to send email for task ${task.$id}: ${(emailErr as Error).message}`
              );
            }
          }

          if (
            prefs?.discordEnabled &&
            prefs?.discordUserId &&
            process.env.DISCORD_BOT_TOKEN
          ) {
            try {
              // Step 1: Create/open a DM channel with the user
              const dmChannelRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
                method: "POST",
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ recipient_id: prefs.discordUserId }),
              });

              if (!dmChannelRes.ok) {
                throw new Error(`Failed to open DM channel: ${dmChannelRes.status}`);
              }

              const dmChannel = (await dmChannelRes.json()) as { id: string };

              // Step 2: Send the reminder message
              const dueLabel = reminderBefore === "on_due" ? "now" : `in ${reminderBefore}`;
              const msgRes = await fetch(
                `https://discord.com/api/v10/channels/${dmChannel.id}/messages`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    content: `⏰ **Task Reminder**\n\n**${task.title}**\nDue: ${task.dueDate} (${dueLabel})`,
                  }),
                }
              );

              if (!msgRes.ok) {
                throw new Error(`Failed to send DM: ${msgRes.status}`);
              }

              logger.info(`Discord DM sent for task: ${task.title}`);
            } catch (discordErr) {
              logger.error(`Failed to send Discord DM: ${(discordErr as Error).message}`);
            }
          }
        });

        sentCount++;
      }
    }

    return { remindersChecked: tasksResponse.length, remindersSent: sentCount };
  }
);
