import { format, parseISO } from "date-fns";
import {
  Calendar,
  Flag,
  Tag,
  CheckCircle2,
  Clock,
  AlignLeft,
  ListTodo,
  FolderKanban,
  CircleDot,
  Bell,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { CalendarTask, Subtask } from "@/features/tasks/types/task.types";
import { getPriorityConfig } from "@/features/tasks/utils/task-helpers";

interface TaskDetailContentProps {
  task: CalendarTask;
  onUpdateSubtasks?: (subtasks: Subtask[]) => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  todo: { label: "To Do", color: "text-muted-foreground", icon: "bg-muted" },
  "in-progress": { label: "In Progress", color: "text-blue-500", icon: "bg-blue-500/10" },
  completed: { label: "Completed", color: "text-green-500", icon: "bg-green-500/10" },
};

export function TaskDetailContent({ task, onUpdateSubtasks }: TaskDetailContentProps) {
  const priorityConfig = getPriorityConfig(task.priority);
  const status = statusConfig[task.status] || statusConfig.todo;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;

  return (
    <div className="space-y-1 pt-2">
      {/* Properties grid */}
      <div className="grid gap-0">
        {/* Status */}
        <PropertyRow icon={<CircleDot className={cn("size-4", status.color)} />} label="Status">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              task.status === "completed" &&
                "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
              task.status === "in-progress" &&
                "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
              task.status === "todo" && "bg-muted"
            )}
          >
            {status.label}
          </Badge>
        </PropertyRow>

        {/* Due Date */}
        {task.dueDate && (
          <PropertyRow
            icon={<Calendar className="size-4 text-muted-foreground" />}
            label="Due date"
          >
            <span className="text-sm">{format(parseISO(task.dueDate), "MMM d, yyyy")}</span>
          </PropertyRow>
        )}

        {/* Time */}
        {(task.startTime || task.endTime) && (
          <PropertyRow icon={<Clock className="size-4 text-muted-foreground" />} label="Time">
            <span className="text-sm">
              {task.startTime && task.endTime
                ? `${task.startTime} – ${task.endTime}`
                : task.startTime || task.endTime}
            </span>
          </PropertyRow>
        )}

        {/* Priority */}
        <PropertyRow
          icon={<Flag className={cn("size-4", priorityConfig.iconClass)} />}
          label="Priority"
        >
          <Badge variant="outline" className={cn("text-xs font-medium", priorityConfig.badgeClass)}>
            {priorityConfig.label}
          </Badge>
        </PropertyRow>

        {/* Category */}
        {task.category && (
          <PropertyRow icon={<Tag className="size-4 text-cyan-500" />} label="Category">
            <span className="text-sm">{task.category}</span>
          </PropertyRow>
        )}

        {/* Project */}
        {task.project && task.project !== "inbox" && (
          <PropertyRow icon={<FolderKanban className="size-4 text-purple-500" />} label="Project">
            <span className="text-sm">{task.project}</span>
          </PropertyRow>
        )}

        {/* Reminder */}
        {task.reminderEnabled && (
          <PropertyRow icon={<Bell className="size-4 text-[#e44232]" />} label="Reminder">
            <Badge
              variant="outline"
              className="text-xs font-medium bg-[#e44232]/10 border-[#e44232]/20 text-[#e44232]"
            >
              {task.reminderBefore === "on_due" && "At due time"}
              {task.reminderBefore === "30m" && "30 min before"}
              {task.reminderBefore === "1h" && "1 hour before"}
              {task.reminderBefore === "1d" && "1 day before"}
              {!task.reminderBefore && "Enabled"}
            </Badge>
          </PropertyRow>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <AlignLeft className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pl-6 text-foreground/80">
            {task.description}
          </p>
        </div>
      )}

      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListTodo className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Subtasks
              </span>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-muted mb-3 ml-6 max-w-[calc(100%-1.5rem)]">
            <div
              className="h-full rounded-full bg-[#e44232] transition-all duration-300"
              style={{
                width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
              }}
            />
          </div>

          <ul className="space-y-1 pl-6">
            {task.subtasks.map((subtask, index) => (
              <li key={index} className="flex items-center gap-2.5 group py-1">
                <button
                  onClick={() => {
                    if (!onUpdateSubtasks) return;
                    const updated = task.subtasks!.map((s, i) =>
                      i === index ? { ...s, completed: !s.completed } : s
                    );
                    onUpdateSubtasks(updated);
                  }}
                  className={cn(
                    "flex items-center justify-center size-4 rounded-full border-2 shrink-0 transition-all",
                    subtask.completed
                      ? "bg-[#e44232] border-[#e44232]"
                      : "border-muted-foreground/30 hover:border-[#e44232]"
                  )}
                >
                  {subtask.completed && <CheckCircle2 className="size-3 text-white" />}
                </button>
                <span
                  className={cn(
                    "text-sm leading-relaxed break-words flex-1",
                    subtask.completed && "line-through text-muted-foreground"
                  )}
                >
                  {subtask.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Compact property row used in the details grid */
function PropertyRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-1">
      <div className="flex items-center gap-2 w-28 shrink-0">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
