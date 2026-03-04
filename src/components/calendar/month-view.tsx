import { format } from "date-fns";
import { useState } from "react";
import { useCalendar } from "@/context/calendar-context";
import { generateMonthCalendar } from "@/lib/calendar-helpers";
import { cn } from "@/lib/utils";
import { TaskDetailsDialog, DraggableTask } from "@/components/task";
import { DroppableDayCell } from "./dnd/droppable-day-cell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { CalendarTask, TaskColor } from "@/types/calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const COLOR_CLASSES: Record<TaskColor, { bg: string; border: string; dot: string; text: string }> =
  {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-500",
      dot: "fill-blue-500",
      text: "text-blue-700 dark:text-blue-300",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-500",
      dot: "fill-green-500",
      text: "text-green-700 dark:text-green-300",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-500",
      dot: "fill-red-500",
      text: "text-red-700 dark:text-red-300",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      border: "border-yellow-500",
      dot: "fill-yellow-500",
      text: "text-yellow-700 dark:text-yellow-300",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-500",
      dot: "fill-purple-500",
      text: "text-purple-700 dark:text-purple-300",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/30",
      border: "border-orange-500",
      dot: "fill-orange-500",
      text: "text-orange-700 dark:text-orange-300",
    },
    gray: {
      bg: "bg-gray-50 dark:bg-gray-950/30",
      border: "border-gray-500",
      dot: "fill-gray-500",
      text: "text-gray-700 dark:text-gray-300",
    },
  };

const MAX_VISIBLE_TASKS = 3;

interface TaskBadgeProps {
  task: CalendarTask;
  variant: "colored" | "mixed" | "dot";
}

function TaskBadge({ task, variant }: TaskBadgeProps) {
  const colorClasses = COLOR_CLASSES[task.color];

  if (variant === "dot") {
    return (
      <DraggableTask task={task}>
        <TaskDetailsDialog task={task}>
          <button className="w-full text-left px-2 py-1 rounded text-xs truncate hover:bg-accent transition-colors flex items-center gap-1.5">
            <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0">
              <circle cx="4" cy="4" r="4" className={colorClasses.dot} />
            </svg>
            <span className="font-medium truncate">{task.title}</span>
          </button>
        </TaskDetailsDialog>
      </DraggableTask>
    );
  }

  if (variant === "mixed") {
    return (
      <DraggableTask task={task}>
        <TaskDetailsDialog task={task}>
          <button
            className={cn(
              "w-full text-left px-2 py-1 rounded text-xs truncate",
              "hover:opacity-80 transition-opacity border",
              colorClasses.bg,
              colorClasses.border,
              "flex items-center gap-1.5"
            )}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" className="shrink-0">
              <circle cx="4" cy="4" r="4" className={colorClasses.dot} />
            </svg>
            <span className={cn("font-medium truncate", colorClasses.text)}>{task.title}</span>
          </button>
        </TaskDetailsDialog>
      </DraggableTask>
    );
  }

  // colored variant
  return (
    <DraggableTask task={task}>
      <TaskDetailsDialog task={task}>
        <button
          className={cn(
            "w-full text-left px-2 py-1 rounded text-xs truncate",
            "hover:opacity-80 transition-opacity border",
            colorClasses.bg,
            colorClasses.border
          )}
        >
          <span className={cn("font-medium", colorClasses.text)}>{task.title}</span>
        </button>
      </TaskDetailsDialog>
    </DraggableTask>
  );
}

export function MonthView() {
  const { selectedDate, tasks, badgeVariant } = useCalendar();
  const weeks = generateMonthCalendar(selectedDate, tasks);
  const [showMoreDialog, setShowMoreDialog] = useState<{
    date: Date;
    tasks: CalendarTask[];
  } | null>(null);

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-card">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {weeks.map((week, weekIndex) =>
            week.map((cell, dayIndex) => {
              const dayNumber = format(cell.date, "d");
              const isFirstOfMonth = dayNumber === "1";
              const visibleTasks = cell.tasks.slice(0, MAX_VISIBLE_TASKS);
              const remainingCount = cell.tasks.length - MAX_VISIBLE_TASKS;

              return (
                <DroppableDayCell key={`${weekIndex}-${dayIndex}`} date={cell.date}>
                  <div
                    className={cn(
                      "h-32 border-r border-b last:border-r-0 p-2 flex flex-col",
                      !cell.isCurrentMonth && "bg-muted/20",
                      cell.isToday && "bg-primary/5"
                    )}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1 shrink-0">
                      <span
                        className={cn(
                          "text-sm font-medium flex items-center justify-center rounded-full size-7",
                          cell.isToday && "bg-primary text-primary-foreground font-bold",
                          !cell.isCurrentMonth && "text-muted-foreground",
                          cell.isCurrentMonth && !cell.isToday && "text-foreground"
                        )}
                      >
                        {dayNumber}
                      </span>
                      {isFirstOfMonth && (
                        <span className="text-xs text-muted-foreground font-medium">
                          {format(cell.date, "MMM")}
                        </span>
                      )}
                    </div>

                    {/* Tasks */}
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {visibleTasks.map((task) => (
                        <TaskBadge key={task.id} task={task} variant={badgeVariant} />
                      ))}
                      {remainingCount > 0 && (
                        <button
                          onClick={() => setShowMoreDialog({ date: cell.date, tasks: cell.tasks })}
                          className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-2 py-1 hover:bg-accent rounded transition-colors font-semibold"
                        >
                          +{remainingCount} more
                        </button>
                      )}
                    </div>
                  </div>
                </DroppableDayCell>
              );
            })
          )}
        </div>
      </div>

      {/* Show More Dialog */}
      <Dialog open={!!showMoreDialog} onOpenChange={(open) => !open && setShowMoreDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showMoreDialog && format(showMoreDialog.date, "MMMM d, yyyy")} (
              {showMoreDialog?.tasks.length} tasks)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {showMoreDialog?.tasks.map((task) => (
              <TaskDetailsDialog key={task.id} task={task}>
                <button
                  className={cn(
                    "w-full text-left px-3 py-2 rounded border hover:bg-accent transition-colors",
                    COLOR_CLASSES[task.color].bg,
                    COLOR_CLASSES[task.color].border
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("font-medium", COLOR_CLASSES[task.color].text)}>
                      {task.title}
                    </span>
                    <Badge variant="secondary" className="shrink-0">
                      Priority {task.priority}
                    </Badge>
                  </div>
                  {task.startTime && task.endTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.startTime} - {task.endTime}
                    </p>
                  )}
                </button>
              </TaskDetailsDialog>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
