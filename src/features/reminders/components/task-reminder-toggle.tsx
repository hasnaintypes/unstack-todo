import { Bell, BellOff } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import type { ReminderBefore } from "@/features/tasks/types/task.types";

interface TaskReminderToggleProps {
  enabled: boolean;
  reminderBefore: ReminderBefore;
  onToggle: (enabled: boolean) => void;
  onReminderBeforeChange: (value: ReminderBefore) => void;
}

const REMINDER_OPTIONS: { value: ReminderBefore; label: string }[] = [
  { value: "on_due", label: "At due time" },
  { value: "30m", label: "30 minutes before" },
  { value: "1h", label: "1 hour before" },
  { value: "1d", label: "1 day before" },
];

export function TaskReminderToggle({
  enabled,
  reminderBefore,
  onToggle,
  onReminderBeforeChange,
}: TaskReminderToggleProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 gap-2 px-3 text-sm font-medium",
            enabled
              ? "text-brand border-brand/30 hover:bg-brand/5"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          {enabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
          {enabled
            ? REMINDER_OPTIONS.find((o) => o.value === reminderBefore)?.label || "Reminder"
            : "Reminder"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Remind me
            </span>
            <button
              onClick={() => onToggle(!enabled)}
              className={cn(
                "text-xs font-medium transition-colors",
                enabled ? "text-brand" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {enabled ? "Disable" : "Enable"}
            </button>
          </div>
          {REMINDER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onReminderBeforeChange(option.value);
                if (!enabled) onToggle(true);
              }}
              className={cn(
                "flex items-center w-full rounded-md px-2 py-1.5 text-sm transition-colors",
                enabled && reminderBefore === option.value
                  ? "bg-brand/10 text-brand"
                  : "hover:bg-accent text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
