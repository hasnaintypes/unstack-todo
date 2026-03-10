import { Client, Databases, Query } from "node-appwrite";

/**
 * Discord OAuth — HTTP Function
 *
 * Handles Discord OAuth2 connect/callback/disconnect flow.
 * Stores Discord user ID in user_preferences for DM notifications.
 *
 * Routes:
 *   GET  /connect    — Redirects to Discord OAuth2 authorization
 *   GET  /callback   — Handles OAuth2 callback, stores Discord user ID
 *   POST /disconnect — Removes Discord connection
 *
 * Environment variables:
 * - APPWRITE_ENDPOINT
 * - APPWRITE_PROJECT_ID
 * - APPWRITE_API_KEY
 * - APPWRITE_DATABASE_ID
 * - PREFERENCES_COLLECTION_ID
 * - DISCORD_CLIENT_ID
 * - DISCORD_CLIENT_SECRET
 * - DISCORD_REDIRECT_URI
 * - APP_URL (frontend URL for redirects)
 */

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
  const PREFERENCES_COLLECTION_ID = process.env.PREFERENCES_COLLECTION_ID || "user_preferences";
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
  const APP_URL = process.env.APP_URL || "http://localhost:5173";

  const path = req.path;

  try {
    // Connect — redirect to Discord OAuth2
    if (path === "/connect" && req.method === "GET") {
      const userId = req.query.userId;
      if (!userId) return res.json({ error: "userId required" }, 400);

      const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify&state=${userId}`;

      return res.redirect(authUrl);
    }

    // Callback — exchange code for token, get Discord user, store ID
    if (path === "/callback" && req.method === "GET") {
      const { code, state: userId } = req.query;

      if (!code || !userId) {
        return res.redirect(`${APP_URL}/settings?discord=error`);
      }

      // Exchange code for access token
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: DISCORD_REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        error("Discord token exchange failed");
        return res.redirect(`${APP_URL}/settings?discord=error`);
      }

      const tokenData = await tokenResponse.json();

      // Get Discord user info
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userResponse.ok) {
        error("Discord user fetch failed");
        return res.redirect(`${APP_URL}/settings?discord=error`);
      }

      const discordUser = await userResponse.json();

      // Update user preferences with Discord user ID
      const prefsResponse = await databases.listDocuments(
        DATABASE_ID,
        PREFERENCES_COLLECTION_ID,
        [Query.equal("userId", userId), Query.limit(1)]
      );

      if (prefsResponse.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          PREFERENCES_COLLECTION_ID,
          prefsResponse.documents[0].$id,
          {
            discordEnabled: true,
            discordUserId: discordUser.id,
          }
        );
      }

      log(`Discord connected for user ${userId}: ${discordUser.username}`);
      return res.redirect(`${APP_URL}/settings?discord=connected`);
    }

    // Disconnect — remove Discord connection
    if (path === "/disconnect" && req.method === "POST") {
      const { userId } = JSON.parse(req.body || "{}");
      if (!userId) return res.json({ error: "userId required" }, 400);

      const prefsResponse = await databases.listDocuments(
        DATABASE_ID,
        PREFERENCES_COLLECTION_ID,
        [Query.equal("userId", userId), Query.limit(1)]
      );

      if (prefsResponse.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          PREFERENCES_COLLECTION_ID,
          prefsResponse.documents[0].$id,
          {
            discordEnabled: false,
            discordUserId: null,
          }
        );
      }

      log(`Discord disconnected for user ${userId}`);
      return res.json({ success: true });
    }

    return res.json({ error: "Not found" }, 404);
  } catch (err) {
    error(`Discord OAuth error: ${err.message}`);
    return res.json({ success: false, error: err.message }, 500);
  }
};
