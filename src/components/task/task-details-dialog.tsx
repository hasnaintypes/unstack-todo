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
  Palette,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CalendarTask, TaskColor } from "@/types/task";
import { getPriorityLabel } from "@/lib/task-helpers";

interface TaskDetailsSheetProps {
  task: CalendarTask;
  children: React.ReactNode;
}

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
};

const COLOR_DISPLAY: Record<
  TaskColor,
  { name: string; badgeClass: string; iconClass: string }
> = {
  blue: {
    name: "Blue",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    iconClass: "text-blue-500",
  },
  green: {
    name: "Green",
    badgeClass: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
    iconClass: "text-green-500",
  },
  red: {
    name: "Red",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
    iconClass: "text-red-500",
  },
  yellow: {
    name: "Yellow",
    badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20",
    iconClass: "text-yellow-500",
  },
  purple: {
    name: "Purple",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    iconClass: "text-purple-500",
  },
  orange: {
    name: "Orange",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    iconClass: "text-orange-500",
  },
  gray: {
    name: "Gray",
    badgeClass: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20",
    iconClass: "text-gray-500",
  },
};

const PRIORITY_CONFIG = {
  1: {
    class: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    iconClass: "text-blue-500",
  },
  2: {
    class: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20",
    iconClass: "text-yellow-500",
  },
  3: {
    class: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    iconClass: "text-orange-500",
  },
  4: {
    class: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
    iconClass: "text-red-500",
  },
};

export function TaskDetailsSheet({ task, children }: TaskDetailsSheetProps) {
  const colorConfig = COLOR_DISPLAY[task.color];
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-semibold leading-tight pr-6">
            {task.title}
          </SheetTitle>
        </SheetHeader>

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
                priorityConfig.iconClass === "text-blue-500" && "bg-blue-500/10",
                priorityConfig.iconClass === "text-yellow-500" && "bg-yellow-500/10",
                priorityConfig.iconClass === "text-orange-500" && "bg-orange-500/10",
                priorityConfig.iconClass === "text-red-500" && "bg-red-500/10"
              )}
            >
              <Flag className={cn("h-5 w-5", priorityConfig.iconClass)} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Priority
              </p>
              <Badge variant="outline" className={cn("font-medium", priorityConfig.class)}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
          </div>

          {/* Color */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                colorConfig.iconClass === "text-blue-500" && "bg-blue-500/10",
                colorConfig.iconClass === "text-green-500" && "bg-green-500/10",
                colorConfig.iconClass === "text-red-500" && "bg-red-500/10",
                colorConfig.iconClass === "text-yellow-500" && "bg-yellow-500/10",
                colorConfig.iconClass === "text-purple-500" && "bg-purple-500/10",
                colorConfig.iconClass === "text-orange-500" && "bg-orange-500/10",
                colorConfig.iconClass === "text-gray-500" && "bg-gray-500/10"
              )}
            >
              <Palette className={cn("h-5 w-5", colorConfig.iconClass)} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Color
              </p>
              <Badge variant="outline" className={cn("font-medium", colorConfig.badgeClass)}>
                {colorConfig.name}
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
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Subtasks
                  </p>
                  <ul className="space-y-2">
                    {task.subtasks.map((subtask, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <Circle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span className="text-sm leading-relaxed wrap-break-word">{subtask}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
