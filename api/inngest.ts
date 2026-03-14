import { serve } from "inngest/node";
import { inngest } from "./inngest/client.js";
import { checkReminders } from "./inngest/functions/check-reminders.js";
import { dailySummary } from "./inngest/functions/daily-summary.js";
import { purgeTrash } from "./inngest/functions/purge-trash.js";

export default serve({
  client: inngest,
  functions: [checkReminders, dailySummary, purgeTrash],
});
