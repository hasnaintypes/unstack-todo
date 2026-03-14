/**
 * Appwrite Database Setup Script
 *
 * Creates all collections (profiles, projects, categories, tasks, subtasks)
 * with columns, indexes, and permissions using the Appwrite SDK.
 *
 * Usage:
 *   node scripts/setup-db.mjs
 *
 * Required environment variables (in .env):
 *   VITE_APPWRITE_ENDPOINT     - Appwrite API endpoint
 *   VITE_APPWRITE_PROJECT_ID   - Appwrite project ID
 *   VITE_APPWRITE_DATABASE_ID  - Appwrite database ID (optional — auto-creates)
 *   APPWRITE_API_KEY           - Server-side API key (databases + collections scope)
 *
 * The script will:
 *   1. Create the database (if it doesn't exist)
 *   2. Create all 5 collections with columns, indexes, and permissions
 *   3. Output all collection IDs for your .env file
 */

import { Client, Databases, Permission, Role, ID } from "node-appwrite";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Load .env manually (no dotenv dependency needed)
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
    // .env file is optional if vars are set in environment
  }
}

loadEnv();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error(
    "\n  Missing required environment variables.\n\n" +
      "  Ensure these are set in your .env file:\n" +
      "    VITE_APPWRITE_ENDPOINT     (e.g. https://cloud.appwrite.io/v1)\n" +
      "    VITE_APPWRITE_PROJECT_ID   (your project ID)\n" +
      "    VITE_APPWRITE_DATABASE_ID  (your database ID, or leave blank to auto-create)\n" +
      "    APPWRITE_API_KEY           (server-side API key with databases scope)\n"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Appwrite client (server-side)
// ---------------------------------------------------------------------------
const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

const databases = new Databases(client);

// ---------------------------------------------------------------------------
// Shared permissions — document-level permissions are set per-document on
// creation. Collection-level permissions allow any authenticated user to
// create, but read/update/delete are controlled per-document.
// ---------------------------------------------------------------------------
const collectionPermissions = [
  Permission.create(Role.users()),
  Permission.read(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users()),
];

// ---------------------------------------------------------------------------
// Table definitions
// ---------------------------------------------------------------------------

/**
 * PROFILES — App-specific user preferences and settings.
 * Appwrite Auth stores name/email/avatar, this stores app settings.
 * One document per user (use userId as document ID).
 */
const PROFILES = {
  id: "profiles",
  name: "Profiles",
  columns: [
    { key: "userId", type: "varchar", size: 256, required: true },
    { key: "displayName", type: "varchar", size: 256, required: false },
    { key: "avatarUrl", type: "varchar", size: 2048, required: false },
    { key: "timezone", type: "varchar", size: 100, required: false },
    { key: "defaultProjectId", type: "varchar", size: 256, required: false },
    {
      key: "weekStartsOn",
      type: "integer",
      required: false,
      min: 0,
      max: 6,
      defaultValue: 1,
    },
    {
      key: "defaultPriority",
      type: "integer",
      required: false,
      min: 1,
      max: 4,
      defaultValue: 2,
    },
    { key: "onboardingCompleted", type: "boolean", required: false, defaultValue: false },
  ],
  indexes: [{ key: "idx_userId", type: "unique", attributes: ["userId"] }],
  permissions: collectionPermissions,
};

/**
 * PROJECTS — User-created projects to group tasks.
 * Tasks reference projects by document $id.
 */
const PROJECTS = {
  id: "projects",
  name: "Projects",
  columns: [
    { key: "name", type: "varchar", size: 256, required: true },
    { key: "description", type: "text", required: false },
    { key: "color", type: "varchar", size: 50, required: false, defaultValue: "blue" },
    { key: "icon", type: "varchar", size: 50, required: false },
    { key: "userId", type: "varchar", size: 256, required: true },
    { key: "isFavorite", type: "boolean", required: false, defaultValue: false },
    { key: "isArchived", type: "boolean", required: false, defaultValue: false },
    { key: "order", type: "integer", required: false, min: 0, max: 10000, defaultValue: 0 },
  ],
  indexes: [
    { key: "idx_userId", type: "key", attributes: ["userId"] },
    { key: "idx_userId_archived", type: "key", attributes: ["userId", "isArchived"] },
    { key: "idx_userId_order", type: "key", attributes: ["userId", "order"] },
  ],
  permissions: collectionPermissions,
};

/**
 * CATEGORIES — User-created categories/labels for tasks.
 * Tasks reference categories by document $id.
 */
const CATEGORIES = {
  id: "categories",
  name: "Categories",
  columns: [
    { key: "name", type: "varchar", size: 256, required: true },
    { key: "color", type: "varchar", size: 50, required: false, defaultValue: "gray" },
    { key: "userId", type: "varchar", size: 256, required: true },
    { key: "order", type: "integer", required: false, min: 0, max: 10000, defaultValue: 0 },
  ],
  indexes: [
    { key: "idx_userId", type: "key", attributes: ["userId"] },
    { key: "idx_userId_order", type: "key", attributes: ["userId", "order"] },
  ],
  permissions: collectionPermissions,
};

/**
 * TASKS — Main task collection.
 * - No 'color' field: color is derived from priority in the UI.
 * - 'projectId' and 'categoryId' reference projects/categories by $id.
 * - Subtasks are stored in a separate collection, not as a JSON blob.
 */
const TASKS = {
  id: "tasks",
  name: "Tasks",
  columns: [
    { key: "title", type: "varchar", size: 256, required: true },
    { key: "description", type: "text", required: false },
    { key: "dueDate", type: "varchar", size: 50, required: false },
    { key: "startTime", type: "varchar", size: 50, required: false },
    { key: "endTime", type: "varchar", size: 50, required: false },
    { key: "priority", type: "integer", required: true, min: 1, max: 4, defaultValue: 2 },
    {
      key: "status",
      type: "enum",
      elements: ["todo", "in-progress", "completed"],
      required: true,
      defaultValue: "todo",
    },
    { key: "categoryId", type: "varchar", size: 256, required: false },
    { key: "projectId", type: "varchar", size: 256, required: false },
    { key: "userId", type: "varchar", size: 256, required: true },
    { key: "deletedAt", type: "datetime", required: false },
    { key: "completedAt", type: "datetime", required: false },
    { key: "order", type: "integer", required: false, min: 0, max: 100000, defaultValue: 0 },
    { key: "subtasks", type: "text", required: false },
    { key: "reminderEnabled", type: "boolean", required: false, defaultValue: false },
    {
      key: "reminderBefore",
      type: "enum",
      elements: ["1d", "1h", "30m", "on_due"],
      required: false,
    },
    {
      key: "recurrence",
      type: "enum",
      elements: ["daily", "weekly", "monthly", "weekdays"],
      required: false,
    },
    { key: "tags", type: "text", required: false },
    { key: "attachments", type: "text", required: false },
  ],
  indexes: [
    { key: "idx_userId", type: "key", attributes: ["userId"] },
    { key: "idx_status", type: "key", attributes: ["status"] },
    { key: "idx_dueDate", type: "key", attributes: ["dueDate"] },
    { key: "idx_deletedAt", type: "key", attributes: ["deletedAt"] },
    { key: "idx_projectId", type: "key", attributes: ["projectId"] },
    { key: "idx_categoryId", type: "key", attributes: ["categoryId"] },
    { key: "idx_userId_status", type: "key", attributes: ["userId", "status"] },
    { key: "idx_userId_deletedAt", type: "key", attributes: ["userId", "deletedAt"] },
    { key: "idx_userId_projectId", type: "key", attributes: ["userId", "projectId"] },
    { key: "idx_createdAt", type: "key", attributes: ["$createdAt"] },
    { key: "idx_reminderEnabled", type: "key", attributes: ["reminderEnabled", "dueDate"] },
  ],
  permissions: collectionPermissions,
};

/**
 * SUBTASKS — Individual subtasks belonging to a task.
 * Stored as separate documents instead of a JSON blob for proper
 * queryability, individual completion tracking, and ordering.
 */
const SUBTASKS = {
  id: "subtasks",
  name: "Subtasks",
  columns: [
    { key: "title", type: "varchar", size: 256, required: true },
    { key: "taskId", type: "varchar", size: 256, required: true },
    { key: "userId", type: "varchar", size: 256, required: true },
    { key: "isCompleted", type: "boolean", required: true },
    { key: "completedAt", type: "datetime", required: false },
    { key: "order", type: "integer", required: false, min: 0, max: 10000, defaultValue: 0 },
  ],
  indexes: [
    { key: "idx_taskId", type: "key", attributes: ["taskId"] },
    { key: "idx_userId", type: "key", attributes: ["userId"] },
    { key: "idx_taskId_order", type: "key", attributes: ["taskId", "order"] },
    { key: "idx_taskId_completed", type: "key", attributes: ["taskId", "isCompleted"] },
  ],
  permissions: collectionPermissions,
};

/**
 * USER_PREFERENCES — Notification and reminder preferences per user.
 * One document per user. Created automatically on signup.
 */
const USER_PREFERENCES = {
  id: "user_preferences",
  name: "User Preferences",
  columns: [
    { key: "userId", type: "varchar", size: 256, required: true },
    { key: "emailEnabled", type: "boolean", required: false, defaultValue: false },
    { key: "discordEnabled", type: "boolean", required: false, defaultValue: false },
    { key: "discordUserId", type: "varchar", size: 256, required: false },
    { key: "dailySummaryEnabled", type: "boolean", required: false, defaultValue: false },
    { key: "dailySummaryTime", type: "varchar", size: 10, required: false, defaultValue: "09:00" },
    {
      key: "defaultReminderBefore",
      type: "enum",
      elements: ["1d", "1h", "30m", "on_due"],
      required: false,
      defaultValue: "1h",
    },
    { key: "focusModeDefault", type: "boolean", required: false, defaultValue: false },
  ],
  indexes: [
    { key: "idx_userId", type: "unique", attributes: ["userId"] },
    {
      key: "idx_dailySummary",
      type: "key",
      attributes: ["dailySummaryEnabled", "dailySummaryTime"],
    },
  ],
  permissions: collectionPermissions,
};

/**
 * TASK_COMMENTS — Comments on tasks. One-to-many relationship with tasks.
 */
const TASK_COMMENTS = {
  id: "task_comments",
  name: "Task Comments",
  columns: [
    { key: "taskId", type: "varchar", size: 256, required: true },
    { key: "userId", type: "varchar", size: 256, required: true },
    { key: "content", type: "text", required: true },
  ],
  indexes: [
    { key: "idx_taskId", type: "key", attributes: ["taskId"] },
    { key: "idx_userId", type: "key", attributes: ["userId"] },
    { key: "idx_taskId_createdAt", type: "key", attributes: ["taskId", "$createdAt"] },
  ],
  permissions: collectionPermissions,
};

/**
 * TASK_TEMPLATES — Saved task templates for quick task creation.
 */
const TASK_TEMPLATES = {
  id: "task_templates",
  name: "Task Templates",
  columns: [
    { key: "userId", type: "varchar", size: 256, required: true },
    { key: "name", type: "varchar", size: 256, required: true },
    { key: "title", type: "varchar", size: 256, required: true },
    { key: "description", type: "text", required: false },
    { key: "priority", type: "integer", required: false, min: 1, max: 4, defaultValue: 2 },
    { key: "subtasks", type: "text", required: false },
    { key: "categoryId", type: "varchar", size: 256, required: false },
    { key: "projectId", type: "varchar", size: 256, required: false },
  ],
  indexes: [
    { key: "idx_userId", type: "key", attributes: ["userId"] },
  ],
  permissions: collectionPermissions,
};

// All tables in creation order
const ALL_TABLES = [PROFILES, PROJECTS, CATEGORIES, TASKS, SUBTASKS, USER_PREFERENCES, TASK_COMMENTS, TASK_TEMPLATES];

// ---------------------------------------------------------------------------
// Setup functions
// ---------------------------------------------------------------------------

async function ensureDatabase() {
  let dbId = DATABASE_ID;

  if (!dbId) {
    console.log("  No DATABASE_ID provided, creating new database...");
    const db = await databases.create(ID.unique(), "unstack-todo");
    dbId = db.$id;
    console.log(`  Database created: ${dbId}`);
    console.log(`  >> Add to .env: VITE_APPWRITE_DATABASE_ID=${dbId}\n`);
  } else {
    try {
      await databases.get(dbId);
      console.log(`  Database found: ${dbId}`);
    } catch (err) {
      if (err.code === 404) {
        console.log(`  Database '${dbId}' not found, creating...`);
        const db = await databases.create(dbId, "unstack-todo");
        dbId = db.$id;
        console.log(`  Database created: ${dbId}`);
      } else {
        throw err;
      }
    }
  }

  return dbId;
}

/**
 * Create a single collection with all its attributes and indexes.
 * If the collection already exists, adds any missing attributes and indexes.
 */
async function createTable(dbId, table) {
  const { id, name, columns, indexes, permissions } = table;

  console.log(`\n  ── ${name} (${id}) ──`);

  // Check if collection already exists
  let existing = null;
  try {
    existing = await databases.getCollection(dbId, id);
  } catch (err) {
    if (err.code !== 404) throw err;
  }

  if (existing) {
    // Collection exists — find and add missing attributes
    const existingKeys = new Set(existing.attributes.map((a) => a.key));
    const missingColumns = columns.filter((col) => !existingKeys.has(col.key));

    if (missingColumns.length === 0) {
      console.log(`  Already exists with all ${columns.length} attributes. Checking indexes...`);
    } else {
      console.log(`  Already exists. Adding ${missingColumns.length} missing attribute(s)...`);
      for (const col of missingColumns) {
        try {
          await createAttribute(dbId, id, col);
          console.log(`    + ${col.key} (${col.type})`);
        } catch (err) {
          console.error(`    ! Failed: ${col.key} — ${err.message}`);
        }
      }

      // Wait for the new attributes to become available
      const totalExpected = existingKeys.size + missingColumns.length;
      console.log(`  Waiting for ${totalExpected} attributes...`);
      await waitForAttributes(dbId, id, totalExpected);
    }

    // Check for missing indexes
    const existingIndexKeys = new Set(existing.indexes.map((idx) => idx.key));
    const missingIndexes = indexes.filter((idx) => !existingIndexKeys.has(idx.key));

    if (missingIndexes.length > 0) {
      console.log(`  Adding ${missingIndexes.length} missing index(es)...`);
      for (const idx of missingIndexes) {
        try {
          await databases.createIndex(dbId, id, idx.key, idx.type, idx.attributes);
          console.log(`    + ${idx.key} (${idx.attributes.join(", ")})`);
        } catch (err) {
          console.error(`    ! Failed: ${idx.key} — ${err.message}`);
        }
      }
    } else {
      console.log(`  All ${indexes.length} indexes present.`);
    }

    return id;
  }

  // Create new collection
  const collection = await databases.createCollection(dbId, id, name, permissions);
  console.log(`  Collection created: ${collection.$id}`);

  // Create attributes
  for (const col of columns) {
    try {
      await createAttribute(dbId, id, col);
      console.log(`    + ${col.key} (${col.type})`);
    } catch (err) {
      console.error(`    ! Failed: ${col.key} — ${err.message}`);
    }
  }

  // Wait for all attributes to become available
  console.log(`  Waiting for ${columns.length} attributes...`);
  await waitForAttributes(dbId, id, columns.length);

  // Create indexes
  console.log(`  Creating ${indexes.length} indexes...`);
  for (const idx of indexes) {
    try {
      await databases.createIndex(dbId, id, idx.key, idx.type, idx.attributes);
      console.log(`    + ${idx.key} (${idx.attributes.join(", ")})`);
    } catch (err) {
      console.error(`    ! Failed: ${idx.key} — ${err.message}`);
    }
  }

  return collection.$id;
}

/**
 * Create a single attribute based on its type definition.
 */
async function createAttribute(dbId, collectionId, col) {
  switch (col.type) {
    case "varchar":
      return databases.createStringAttribute(
        dbId,
        collectionId,
        col.key,
        col.size || 256,
        col.required || false,
        col.defaultValue ?? undefined
      );

    case "text":
      return databases.createStringAttribute(
        dbId,
        collectionId,
        col.key,
        16383,
        col.required || false,
        col.defaultValue ?? undefined
      );

    case "integer":
      return databases.createIntegerAttribute(
        dbId,
        collectionId,
        col.key,
        col.required || false,
        col.min ?? undefined,
        col.max ?? undefined,
        col.defaultValue ?? undefined
      );

    case "boolean":
      return databases.createBooleanAttribute(
        dbId,
        collectionId,
        col.key,
        col.required || false,
        col.defaultValue ?? undefined
      );

    case "enum":
      return databases.createEnumAttribute(
        dbId,
        collectionId,
        col.key,
        col.elements,
        col.required || false,
        col.defaultValue ?? undefined
      );

    case "datetime":
      return databases.createDatetimeAttribute(dbId, collectionId, col.key, col.required || false);

    default:
      console.log(`    ? Unknown type: ${col.type} for ${col.key}`);
  }
}

/**
 * Poll until all attributes reach "available" status.
 */
async function waitForAttributes(dbId, collectionId, expectedCount, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    const collection = await databases.getCollection(dbId, collectionId);
    const ready = collection.attributes.filter((a) => a.status === "available").length;
    const failed = collection.attributes.filter((a) => a.status === "failed");
    const settled = ready + failed.length;

    if (ready >= expectedCount) {
      console.log(`  All ${ready} attributes ready.`);
      return;
    }

    // If all attributes have settled (available or failed), stop waiting
    if (settled >= expectedCount) {
      console.warn(
        `  ${ready} available, ${failed.length} failed: ${failed.map((a) => a.key).join(", ")}. Continuing...`
      );
      return;
    }

    console.log(`  ${ready}/${expectedCount} ready, waiting...`);
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.warn("  Warning: Timed out waiting for attributes. Continuing...");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║     Appwrite Database Setup              ║");
  console.log("║     unstack-todo                         ║");
  console.log("╚══════════════════════════════════════════╝\n");
  console.log(`  Endpoint:   ${ENDPOINT}`);
  console.log(`  Project:    ${PROJECT_ID}`);
  console.log(`  Database:   ${DATABASE_ID || "(auto-create)"}`);
  console.log(`  Tables:     ${ALL_TABLES.map((t) => t.id).join(", ")}`);

  try {
    const dbId = await ensureDatabase();
    const results = {};

    for (const table of ALL_TABLES) {
      results[table.id] = await createTable(dbId, table);
    }

    console.log("\n╔══════════════════════════════════════════╗");
    console.log("║     Setup Complete!                      ║");
    console.log("╚══════════════════════════════════════════╝\n");
    console.log("  Add these to your .env file:\n");
    console.log(`    VITE_APPWRITE_DATABASE_ID=${dbId}`);
    for (const [name, id] of Object.entries(results)) {
      const envKey = `VITE_APPWRITE_${name.toUpperCase()}_COLLECTION_ID`;
      console.log(`    ${envKey}=${id}`);
    }
    console.log("");

    // Summary table
    console.log("  ┌─────────────┬──────────┬─────────┐");
    console.log("  │ Collection  │ Columns  │ Indexes │");
    console.log("  ├─────────────┼──────────┼─────────┤");
    for (const table of ALL_TABLES) {
      const name = table.name.padEnd(11);
      const cols = String(table.columns.length).padStart(5).padEnd(8);
      const idxs = String(table.indexes.length).padStart(4).padEnd(7);
      console.log(`  │ ${name} │ ${cols} │ ${idxs} │`);
    }
    console.log("  └─────────────┴──────────┴─────────┘\n");
  } catch (err) {
    console.error("\n  Setup failed:", err.message || err);
    if (err.response) {
      console.error("  Response:", JSON.stringify(err.response, null, 2));
    }
    process.exit(1);
  }
}

main();
