/**
 * Test Appwrite Messaging — Send a test email
 *
 * Usage:
 *   node scripts/test-email.mjs <recipient-email>
 *
 * Example:
 *   node scripts/test-email.mjs john@example.com
 *
 * Prerequisites:
 *   - SMTP provider configured in Appwrite Console > Messaging > Providers
 *   - .env file with APPWRITE_API_KEY, VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID
 */

import { Client, Messaging, Users, ID } from "node-appwrite";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
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
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* ignore */
  }
}

loadEnv();

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error(
    "\n  Missing env vars. Need VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, APPWRITE_API_KEY\n"
  );
  process.exit(1);
}

const recipientEmail = process.argv[2];
if (!recipientEmail) {
  console.error("\n  Usage: node scripts/test-email.mjs <recipient-email>\n");
  process.exit(1);
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

const messaging = new Messaging(client);
const users = new Users(client);

async function main() {
  console.log("\n=== Appwrite Messaging Test ===\n");
  console.log(`  Endpoint:  ${ENDPOINT}`);
  console.log(`  Project:   ${PROJECT_ID}`);
  console.log(`  Recipient: ${recipientEmail}\n`);

  // Step 1: List providers to verify SMTP is configured
  console.log("1. Checking messaging providers...");
  try {
    const providers = await messaging.listProviders();
    if (providers.total === 0) {
      console.error("\n  No messaging providers found!");
      console.error("  Go to Appwrite Console > Messaging > Providers > Create Provider");
      console.error("  Choose Email > SMTP and configure your SMTP server.\n");
      process.exit(1);
    }

    console.log(`   Found ${providers.total} provider(s):`);
    for (const p of providers.providers) {
      console.log(`   - ${p.name} (${p.type}) — ${p.enabled ? "enabled" : "DISABLED"}`);
    }
    console.log();
  } catch (err) {
    console.error(`   Failed to list providers: ${err.message}`);
    console.error("   Make sure your API key has messaging scope.\n");
    process.exit(1);
  }

  // Step 2: Find or create a target for the recipient email
  console.log("2. Looking up user with that email...");
  let targetUserId = null;
  let targetId = null;

  try {
    const { Query } = await import("node-appwrite");
    const userList = await users.list([Query.equal("email", [recipientEmail])]);
    if (userList.total > 0) {
      const user = userList.users[0];
      targetUserId = user.$id;
      console.log(`   Found user: ${user.name || user.email} (${user.$id})`);

      // Find email target
      const targets = user.targets || [];
      const emailTarget = targets.find((t) => t.providerType === "email");
      if (emailTarget) {
        targetId = emailTarget.$id;
        console.log(`   Email target: ${targetId}`);
      } else {
        console.log("   No email target found on this user.");
        console.log("   This usually means the user registered before Messaging was enabled.");
        console.log(
          "   The user needs to re-verify their email, or you can create a target manually.\n"
        );
      }
    } else {
      console.log(`   No user found with email: ${recipientEmail}`);
      console.log("   Will try sending via direct targets approach...\n");
    }
  } catch (err) {
    console.log(`   Could not look up user: ${err.message}`);
  }

  // Step 3: Try sending the email
  console.log("\n3. Sending test email...");

  const messageId = ID.unique();
  const subject = "Test Email from Unstack Todo";
  const htmlContent = `
    <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #e44232;">Unstack Todo</h2>
      <p>This is a test email from your Unstack Todo app.</p>
      <p>If you're reading this, your Appwrite Messaging SMTP provider is working correctly!</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px;">Sent at ${new Date().toISOString()}</p>
    </div>
  `;

  try {
    // Try method 1: Send to user IDs (works if user has email target)
    if (targetUserId) {
      console.log(`   Sending to user ID: ${targetUserId}`);
      const result = await messaging.createEmail(
        messageId,
        subject,
        htmlContent,
        [], // topics
        [targetUserId], // users
        [], // targets
        [], // cc
        [], // bcc
        [], // attachments (corrected param order)
        false, // draft
        true // html
      );
      console.log(`\n   Email sent successfully!`);
      console.log(`   Message ID: ${result.$id}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Delivered to: ${result.deliveredTotal || 0} target(s)\n`);
      return;
    }

    // Try method 2: Send to specific target
    if (targetId) {
      console.log(`   Sending to target: ${targetId}`);
      const result = await messaging.createEmail(
        messageId,
        subject,
        htmlContent,
        [], // topics
        [], // users
        [targetId], // targets
        [], // cc
        [], // bcc
        [], // attachments
        false, // draft
        true // html
      );
      console.log(`\n   Email sent successfully!`);
      console.log(`   Message ID: ${result.$id}`);
      console.log(`   Status: ${result.status}`);
      return;
    }

    // No user found — show instructions
    console.log("\n   Cannot send: No registered user found with that email.");
    console.log("   To test, use the email of a user who has signed up in the app.\n");
    console.log("   Alternatively, you can test the SMTP provider directly:");
    console.log("   Appwrite Console > Messaging > Messages > Create Message > Email\n");
  } catch (err) {
    console.error(`\n   Failed to send email!`);
    console.error(`   Error: ${err.message}`);

    if (err.message?.includes("Provider")) {
      console.error("\n   This usually means the SMTP provider is misconfigured.");
      console.error("   Check: Appwrite Console > Messaging > Providers");
      console.error("   Verify your SMTP host, port, username, and password.\n");
    } else if (err.message?.includes("target")) {
      console.error("\n   The user has no email target. This happens when:");
      console.error("   - The user signed up before Messaging was enabled");
      console.error("   - The user has no verified email");
      console.error(
        "   Try: Appwrite Console > Messaging > Messages > Create Message (manual test)\n"
      );
    } else {
      console.error(`\n   Full error: ${JSON.stringify(err, null, 2)}\n`);
    }
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
