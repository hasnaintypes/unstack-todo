/**
 * Standalone Inngest dev server
 *
 * Serves the /api/inngest endpoint locally so the Inngest dev server
 * can discover and invoke functions. Run alongside `pnpm dev` (Vite).
 *
 * Usage:
 *   pnpm inngest:serve
 */

import { createServer } from "http";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { serve } from "inngest/node";
import { Inngest } from "inngest";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
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
  // .env is optional
}

const { checkReminders } = await import(
  "../api/inngest/functions/check-reminders.ts"
);
const { dailySummary } = await import(
  "../api/inngest/functions/daily-summary.ts"
);

const inngest = new Inngest({ id: "unstack-todo" });

// serve() from "inngest/node" returns a handler that expects (req, res)
const handler = serve({
  client: inngest,
  functions: [checkReminders, dailySummary],
});

const PORT = process.env.INNGEST_SERVE_PORT || 3001;

const server = createServer((req, res) => {
  if (req.url?.startsWith("/api/inngest")) {
    // Pass raw Node.js req/res directly — this is what inngest/node expects
    handler(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(
    `\n  Inngest API server running at http://localhost:${PORT}/api/inngest`
  );
  console.log(`  Now run in another terminal: pnpm inngest:dev\n`);
});
