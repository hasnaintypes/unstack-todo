export interface UserReminderPreferences {
  id?: string;
  userId: string;
  emailEnabled: boolean;
  discordEnabled: boolean;
  discordUserId?: string;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string; // HH:mm format, e.g. "09:00"
  defaultReminderBefore: "1d" | "1h" | "30m" | "on_due";
}
