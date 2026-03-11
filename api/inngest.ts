import { serve } from "inngest/node";
import { inngest } from "./inngest/client";
import { checkReminders } from "./inngest/functions/check-reminders";
import { dailySummary } from "./inngest/functions/daily-summary";

export default serve({
  client: inngest,
  functions: [checkReminders, dailySummary],
});
