/**
 * Test Script for Inngest Functions + Appwrite Connectivity
 *
 * Tests:
 *   1. Appwrite connection — can we reach the database?
 *   2. Query tasks with reminders — does check-reminders have data to work with?
 *   3. Query user preferences — are notification prefs accessible?
 *   4. Send test email — does Appwrite Messaging work?
 *   5. Discord DM test — can the bot DM your Discord account?
 *   6. Inngest dev server — is it running and reachable?
 *
 * Usage:
 *   node scripts/test-functions.mjs              # run all tests
 *   node scripts/test-functions.mjs email        # test email only
 *   node scripts/test-functions.mjs discord      # test Discord DM only
 *   node scripts/test-functions.mjs inngest      # test Inngest connection only
 *   node scripts/test-functions.mjs appwrite     # test Appwrite queries only
 */

import { Client, Databases, Query, Messaging } from "node-appwrite";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Load .env
// ---------------------------------------------------------------------------
function loadEnv() {
  try {
    const envPath = resolve(__dirname, "..", ".env");
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env file is optional
  }
}

loadEnv();

// ---------------------------------------------------------------------------
// Config (same vars the Inngest functions use)
// ---------------------------------------------------------------------------
const ENDPOINT =
  process.env.APPWRITE_ENDPOINT ||
  process.env.VITE_APPWRITE_ENDPOINT ||
  "https://cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID;
const TASKS_COLLECTION_ID = process.env.TASKS_COLLECTION_ID || "tasks";
const PREFERENCES_COLLECTION_ID =
  process.env.PREFERENCES_COLLECTION_ID || "user_preferences";
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const pass = (msg) => console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
const fail = (msg, err) =>
  console.log(
    `  \x1b[31m✗\x1b[0m ${msg}${err ? ` — ${err.message || err}` : ""}`
  );
const info = (msg) => console.log(`  \x1b[36mℹ\x1b[0m ${msg}`);
const warn = (msg) => console.log(`  \x1b[33m⚠\x1b[0m ${msg}`);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

async function testAppwrite() {
  console.log("\n── Appwrite Connection ──\n");

  if (!PROJECT_ID || !API_KEY || !DATABASE_ID) {
    fail(
      "Missing env vars",
      new Error(
        "Need APPWRITE_PROJECT_ID (or VITE_), APPWRITE_API_KEY, APPWRITE_DATABASE_ID (or VITE_)"
      )
    );
    return null;
  }

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
  const databases = new Databases(client);

  // Test 1: Database access
  try {
    await databases.get(DATABASE_ID);
    pass(`Database connected: ${DATABASE_ID}`);
  } catch (err) {
    fail("Database connection failed", err);
    return null;
  }

  // Test 2: Query tasks with reminders (what check-reminders does)
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TASKS_COLLECTION_ID,
      [
        Query.equal("reminderEnabled", true),
        Query.isNotNull("dueDate"),
        Query.isNull("deletedAt"),
        Query.notEqual("status", "completed"),
        Query.limit(10),
      ]
    );
    pass(
      `Tasks with active reminders: ${response.total} found (showing first ${response.documents.length})`
    );
    for (const task of response.documents) {
      info(
        `  "${task.title}" — due: ${task.dueDate}, reminder: ${task.reminderBefore || "1h"}`
      );
    }
    if (response.total === 0) {
      warn(
        "No tasks have reminders enabled. Enable a reminder on a task to test check-reminders."
      );
    }
  } catch (err) {
    fail("Tasks query failed", err);
  }

  // Test 3: Query user preferences (what both functions use)
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      PREFERENCES_COLLECTION_ID,
      [Query.limit(10)]
    );
    pass(`User preferences found: ${response.total}`);
    for (const pref of response.documents) {
      info(
        `  User ${pref.userId}: email=${pref.emailEnabled}, discord=${pref.discordEnabled}${pref.discordUserId ? ` (${pref.discordUserId})` : ""}, dailySummary=${pref.dailySummaryEnabled} at ${pref.dailySummaryTime || "N/A"}`
      );
    }
  } catch (err) {
    fail("Preferences query failed", err);
  }

  return { client, databases };
}

async function testEmail() {
  console.log("\n── Email (Appwrite Messaging) ──\n");

  if (!PROJECT_ID || !API_KEY) {
    fail("Missing APPWRITE_PROJECT_ID / APPWRITE_API_KEY");
    return;
  }

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
  const databases = new Databases(client);
  const messaging = new Messaging(client);

  // Find a user with emailEnabled
  try {
    const prefs = await databases.listDocuments(
      DATABASE_ID,
      PREFERENCES_COLLECTION_ID,
      [Query.equal("emailEnabled", true), Query.limit(1)]
    );

    if (prefs.documents.length === 0) {
      warn(
        "No users have email notifications enabled. Enable it in Settings > Notifications first."
      );
      return;
    }

    const userId = prefs.documents[0].userId;
    info(`Sending test email to user: ${userId}`);

    await messaging.createEmail({
      messageId: `test-${Date.now()}`,
      subject: "Unstack Todo — Test Notification",
      content:
        "<h2>Test Email</h2><p>This is a test notification from your Unstack Todo app. If you see this, email reminders are working!</p>",
      users: [userId],
      html: true,
    });

    pass("Test email sent! Check your inbox.");
  } catch (err) {
    fail("Email send failed", err);
    if (err.message?.includes("Provider")) {
      warn(
        "You may need to configure an SMTP provider in Appwrite Console > Messaging."
      );
    }
  }
}

async function testDiscord() {
  console.log("\n── Discord Bot DM ──\n");

  if (!DISCORD_BOT_TOKEN) {
    fail("DISCORD_BOT_TOKEN not set in .env");
    info("Get it from: Discord Developer Portal > your bot > Bot tab > Token");
    return;
  }

  if (!PROJECT_ID || !API_KEY || !DATABASE_ID) {
    fail("Missing Appwrite env vars — need them to look up discordUserId");
    return;
  }

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
  const databases = new Databases(client);

  // Find a user with discordEnabled + discordUserId
  try {
    const prefs = await databases.listDocuments(
      DATABASE_ID,
      PREFERENCES_COLLECTION_ID,
      [Query.equal("discordEnabled", true), Query.limit(1)]
    );

    if (prefs.documents.length === 0) {
      warn(
        "No users have Discord enabled. Connect Discord from Settings first."
      );
      return;
    }

    const discordUserId = prefs.documents[0].discordUserId;
    if (!discordUserId) {
      warn(
        "Discord is enabled but no discordUserId is stored. User needs to connect Discord."
      );
      return;
    }

    info(`Opening DM channel with Discord user: ${discordUserId}`);

    // Step 1: Create DM channel
    const dmRes = await fetch(
      "https://discord.com/api/v10/users/@me/channels",
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient_id: discordUserId }),
      }
    );

    if (!dmRes.ok) {
      const body = await dmRes.text();
      fail(`Failed to open DM channel (${dmRes.status})`, { message: body });
      warn(
        "Make sure the bot and user share at least one Discord server."
      );
      return;
    }

    const dmChannel = await dmRes.json();
    pass(`DM channel opened: ${dmChannel.id}`);

    // Step 2: Send test message
    const msgRes = await fetch(
      `https://discord.com/api/v10/channels/${dmChannel.id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content:
            "**Unstack Todo — Test Notification**\n\nThis is a test message from your task reminder bot. If you see this, Discord DMs are working!",
        }),
      }
    );

    if (!msgRes.ok) {
      const body = await msgRes.text();
      fail(`Failed to send DM (${msgRes.status})`, { message: body });
      return;
    }

    pass("Test Discord DM sent! Check your Discord.");
  } catch (err) {
    fail("Discord test failed", err);
  }
}

async function testInngest() {
  console.log("\n── Inngest Dev Server ──\n");

  const inngestUrl = "http://localhost:8288";

  try {
    const res = await fetch(inngestUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok || res.status === 302) {
      pass(`Inngest dev server is running at ${inngestUrl}`);
    } else {
      warn(`Inngest responded with status ${res.status}`);
    }
  } catch {
    fail(`Inngest dev server not reachable at ${inngestUrl}`);
    info("Start it with: pnpm inngest:dev");
    info(
      "Also run: pnpm dev:vercel (in another terminal) so the /api/inngest endpoint is available."
    );
    return;
  }

  // Check if app endpoint is registered
  try {
    const appUrl = "http://localhost:3001/api/inngest";
    const res = await fetch(appUrl, {
      method: "PUT",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      pass(`App endpoint responding at ${appUrl}`);
    } else {
      warn(
        `App endpoint at ${appUrl} returned ${res.status}. Run: pnpm dev:vercel`
      );
    }
  } catch {
    warn(
      "App endpoint not reachable at http://localhost:3001/api/inngest. Run: pnpm dev:vercel"
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const arg = process.argv[2];

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║     Function Test Runner                 ║");
  console.log("║     unstack-todo                         ║");
  console.log("╚══════════════════════════════════════════╝");

  if (!arg || arg === "appwrite") await testAppwrite();
  if (!arg || arg === "email") await testEmail();
  if (!arg || arg === "discord") await testDiscord();
  if (!arg || arg === "inngest") await testInngest();

  console.log("\n── Done ──\n");
}

main().catch(console.error);
