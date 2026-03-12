import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Archive,
  Download,
  Upload,
  Loader2,
  HardDrive,
} from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useTheme } from "@/app/providers/theme-provider";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ReminderSettings } from "@/features/reminders/components/reminder-settings";
import { taskService } from "@/features/tasks/services/task.service";
import { useTasks } from "@/shared/hooks/use-tasks";
import { toast } from "sonner";
import type { CalendarTask } from "@/features/tasks/types/task.types";

export const Route = createLazyFileRoute("/_protected/settings/")({
  component: SettingsPage,
});

const themes = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { refreshTasks } = useTasks();
  const [isExporting, setIsExporting] = useState<"json" | "csv" | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (format: "json" | "csv") => {
    if (!user?.$id || isExporting) return;
    setIsExporting(format);
    try {
      const data =
        format === "json"
          ? await taskService.exportTasksJSON(user.$id)
          : await taskService.exportTasksCSV(user.$id);

      const blob = new Blob([data], {
        type: format === "json" ? "application/json" : "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0];
      a.download = `unstack-tasks-${date}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Tasks exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export tasks");
    } finally {
      setIsExporting(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.$id) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      let tasksToImport: Omit<CalendarTask, "id">[];

      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        tasksToImport = arr.map(
          (t: Partial<CalendarTask>): Omit<CalendarTask, "id"> => ({
            title: t.title || "Untitled",
            description: t.description,
            dueDate: t.dueDate || "",
            priority: t.priority || 2,
            category: t.category,
            project: t.project,
            status: t.status || "todo",
            subtasks: t.subtasks,
            recurrence: t.recurrence,
          })
        );
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length < 2) throw new Error("CSV file is empty");
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        tasksToImport = lines.slice(1).map((line) => {
          const values = line.match(/(".*?"|[^,]+)/g) || [];
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = (values[i] || "").replace(/^"|"$/g, "").replace(/""/g, '"');
          });
          return {
            title: obj.title || "Untitled",
            description: obj.description || undefined,
            dueDate: obj.dueDate || "",
            priority: (parseInt(obj.priority) || 2) as CalendarTask["priority"],
            category: obj.category || undefined,
            project: obj.project || undefined,
            status: (obj.status as CalendarTask["status"]) || "todo",
          };
        });
      } else {
        throw new Error("Unsupported file format. Use .json or .csv");
      }

      const imported = await taskService.importTasks(tasksToImport, user.$id);
      await refreshTasks();
      toast.success(`${imported.length} task${imported.length !== 1 ? "s" : ""} imported`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        `Failed to import: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

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
                    ? "border-brand bg-brand/5"
                    : "border-border hover:border-muted-foreground/30 hover:bg-accent/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full transition-colors",
                    theme === t.value
                      ? "bg-brand/10 text-brand"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <t.icon className="size-5" />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    theme === t.value ? "text-brand" : "text-foreground"
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

      {/* Data Export / Import */}
      <div className="rounded-xl border bg-card">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <HardDrive className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Data</h2>
          </div>
          <p className="text-xs text-muted-foreground">Export or import your tasks</p>
        </div>
        <Separator />
        <div className="p-6 space-y-5">
          <SettingRow
            icon={<Download className="size-4" />}
            title="Export tasks"
            description="Download all your tasks as a file"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
                disabled={!!isExporting}
              >
                {isExporting === "json" && <Loader2 className="size-4 mr-1.5 animate-spin" />}
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
                disabled={!!isExporting}
              >
                {isExporting === "csv" && <Loader2 className="size-4 mr-1.5 animate-spin" />}
                CSV
              </Button>
            </div>
          </SettingRow>
          <SettingRow
            icon={<Upload className="size-4" />}
            title="Import tasks"
            description="Import tasks from a JSON or CSV file"
          >
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                className="hidden"
                onChange={handleImport}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                {isImporting ? (
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="size-4 mr-1.5" />
                )}
                Choose file
              </Button>
            </div>
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
