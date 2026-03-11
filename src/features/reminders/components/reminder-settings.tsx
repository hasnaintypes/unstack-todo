import { useState, useEffect } from "react";
import { Bell, Clock, Mail, MessageCircle } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { reminderService } from "../services/reminder.service";
import type { UserReminderPreferences } from "../types/reminder.types";

function SettingRow({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function ReminderSettings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserReminderPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;
    let cancelled = false;
    reminderService.getPreferences(user.$id).then((p) => {
      if (!cancelled) {
        setPrefs(p);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.$id]);

  const updatePref = async (
    key: keyof Omit<UserReminderPreferences, "id" | "userId">,
    value: unknown
  ) => {
    if (!prefs?.id) return;
    try {
      const updated = await reminderService.updatePreferences(prefs.id, { [key]: value });
      setPrefs(updated);
    } catch {
      toast.error("Failed to update preference");
    }
  };

  if (isLoading || !prefs) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Notifications</h2>
          </div>
          <p className="text-xs text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Notifications</h2>
        </div>
        <p className="text-xs text-muted-foreground">Control how you receive task reminders</p>
      </div>
      <Separator />
      <div className="p-6 space-y-5">
        <SettingRow
          icon={<Mail className="size-4" />}
          title="Email reminders"
          description="Receive email notifications before task deadlines"
        >
          <Switch
            checked={prefs.emailEnabled}
            onCheckedChange={(checked) => updatePref("emailEnabled", checked)}
          />
        </SettingRow>

        <SettingRow
          icon={<MessageCircle className="size-4" />}
          title="Discord notifications"
          description="Get DM reminders via Discord bot"
        >
          <Switch
            checked={prefs.discordEnabled}
            onCheckedChange={(checked) => updatePref("discordEnabled", checked)}
          />
        </SettingRow>

        <SettingRow
          icon={<Clock className="size-4" />}
          title="Daily summary"
          description="Get a daily digest of upcoming tasks"
        >
          <Switch
            checked={prefs.dailySummaryEnabled}
            onCheckedChange={(checked) => updatePref("dailySummaryEnabled", checked)}
          />
        </SettingRow>
      </div>
    </div>
  );
}
