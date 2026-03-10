import { format, parseISO } from "date-fns";
import {
  Calendar,
  Flag,
  Tag,
  CheckCircle2,
  Circle,
  Clock,
  AlignLeft,
  ListTodo,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { CalendarTask, Subtask } from "@/features/tasks/types/task.types";
import { getPriorityConfig } from "@/features/tasks/utils/task-helpers";
import { Separator } from "@/shared/components/ui/separator";

interface TaskDetailContentProps {
  task: CalendarTask;
  onUpdateSubtasks?: (subtasks: Subtask[]) => void;
}

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
};

export function TaskDetailContent({ task, onUpdateSubtasks }: TaskDetailContentProps) {
  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            task.status === "completed"
              ? "bg-green-500/10"
              : task.status === "in-progress"
                ? "bg-blue-500/10"
                : "bg-muted"
          )}
        >
          {task.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Status
          </p>
          <Badge
            variant="outline"
            className={cn(
              "font-medium",
              task.status === "completed" &&
                "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
              task.status === "in-progress" &&
                "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
              task.status === "todo" && "bg-muted"
            )}
          >
            {statusLabels[task.status]}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Due Date */}
      {task.dueDate && (
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Due Date
            </p>
            <p className="text-sm font-medium">
              {format(parseISO(task.dueDate), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </div>
      )}

      {/* Time */}
      {(task.startTime || task.endTime) && (
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Clock className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Time
            </p>
            <p className="text-sm font-medium">
              {task.startTime && task.endTime
                ? `${task.startTime} - ${task.endTime}`
                : task.startTime || task.endTime}
            </p>
          </div>
        </div>
      )}

      <Separator />

      {/* Priority */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            priorityConfig.bgClass
          )}
        >
          <Flag className={cn("h-5 w-5", priorityConfig.iconClass)} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            Priority
          </p>
          <Badge variant="outline" className={cn("font-medium", priorityConfig.badgeClass)}>
            {priorityConfig.label}
          </Badge>
        </div>
      </div>

      {/* Category */}
      {task.category && (
        <>
          <Separator />
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Tag className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Category
              </p>
              <p className="text-sm font-medium">{task.category}</p>
            </div>
          </div>
        </>
      )}

      {/* Description */}
      {task.description && (
        <>
          <Separator />
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
              <AlignLeft className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Description
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                {task.description}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <>
          <Separator />
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
              <ListTodo className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Subtasks
                </p>
                <span className="text-xs text-muted-foreground">
                  {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} completed
                </span>
              </div>
              <ul className="space-y-2">
                {task.subtasks.map((subtask, index) => (
                  <li key={index} className="flex items-center gap-2.5 group">
                    <button
                      onClick={() => {
                        if (!onUpdateSubtasks) return;
                        const updated = task.subtasks!.map((s, i) =>
                          i === index ? { ...s, completed: !s.completed } : s
                        );
                        onUpdateSubtasks(updated);
                      }}
                      className={cn(
                        "flex items-center justify-center h-4.5 w-4.5 rounded-full border-2 shrink-0 transition-all",
                        subtask.completed
                          ? "bg-[#e44232] border-[#e44232]"
                          : "border-muted-foreground/30 hover:border-[#e44232]"
                      )}
                    >
                      {subtask.completed && (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "text-sm leading-relaxed wrap-break-word flex-1",
                        subtask.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {subtask.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
