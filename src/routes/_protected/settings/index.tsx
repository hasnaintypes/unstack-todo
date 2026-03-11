import { createFileRoute } from "@tanstack/react-router";
import { Sun, Moon, Monitor, Palette, Archive } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { useTheme } from "@/app/providers/theme-provider";
import { ReminderSettings } from "@/features/reminders/components/reminder-settings";

export const Route = createFileRoute("/_protected/settings/")({
  component: SettingsPage,
});

const themes = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your workspace preferences</p>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border bg-card">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Appearance</h2>
          </div>
          <p className="text-xs text-muted-foreground">Choose how the app looks</p>
        </div>
        <Separator />
        <div className="p-6">
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all cursor-pointer",
                  theme === t.value
                    ? "border-[#e44232] bg-[#e44232]/5"
                    : "border-border hover:border-muted-foreground/30 hover:bg-accent/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full transition-colors",
                    theme === t.value
                      ? "bg-[#e44232]/10 text-[#e44232]"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <t.icon className="size-5" />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    theme === t.value ? "text-[#e44232]" : "text-foreground"
                  )}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications (Reminders) */}
      <ReminderSettings />

      {/* Task Behavior */}
      <div className="rounded-xl border bg-card">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Archive className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Tasks</h2>
          </div>
          <p className="text-xs text-muted-foreground">Configure task behavior</p>
        </div>
        <Separator />
        <div className="p-6 space-y-5">
          <SettingRow
            icon={<Archive className="size-4" />}
            title="Auto-archive completed tasks"
            description="Move completed tasks to trash after 30 days"
          >
            <Switch />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}

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
