import { format, isSameDay } from "date-fns";
import { useCalendar } from "@/context/calendar-context";
import { getTasksByDate, isWorkingHour } from "@/lib/calendar-helpers";
import { cn } from "@/lib/utils";
import { TaskDetailsDialog, DraggableTask } from "@/components/task";
import { DroppableTimeBlock } from "./dnd/droppable-time-block";
import type { TaskColor } from "@/types/calendar";

const COLOR_CLASSES: Record<TaskColor, { bg: string; border: string; dot: string; text: string }> =
  {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-l-blue-500",
      dot: "fill-blue-500",
      text: "text-blue-700 dark:text-blue-300",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-l-green-500",
      dot: "fill-green-500",
      text: "text-green-700 dark:text-green-300",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-l-red-500",
      dot: "fill-red-500",
      text: "text-red-700 dark:text-red-300",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      border: "border-l-yellow-500",
      dot: "fill-yellow-500",
      text: "text-yellow-700 dark:text-yellow-300",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-l-purple-500",
      dot: "fill-purple-500",
      text: "text-purple-700 dark:text-purple-300",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/30",
      border: "border-l-orange-500",
      dot: "fill-orange-500",
      text: "text-orange-700 dark:text-orange-300",
    },
    gray: {
      bg: "bg-gray-50 dark:bg-gray-950/30",
      border: "border-l-gray-500",
      dot: "fill-gray-500",
      text: "text-gray-700 dark:text-gray-300",
    },
  };

export function DayView() {
  const { selectedDate, tasks, badgeVariant, workingHours, visibleHoursStart, visibleHoursEnd } =
    useCalendar();
  const dayTasks = getTasksByDate(tasks, selectedDate);

  // Generate only visible hours
  const allHours = Array.from({ length: 24 }, (_, i) => i);
  const hours = allHours.filter((h) => h >= visibleHoursStart && h < visibleHoursEnd);

  // Get tasks with time
  const tasksWithTime = dayTasks.filter((task) => task.startTime);
  const tasksWithoutTime = dayTasks.filter((task) => !task.startTime);

  // Helper to get task position and height
  const getTaskStyle = (task: (typeof dayTasks)[0]) => {
    if (!task.startTime) return {};

    const [startHour, startMinute] = task.startTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;

    let durationMinutes = 60; // default 1 hour
    if (task.endTime) {
      const [endHour, endMinute] = task.endTime.split(":").map(Number);
      const endMinutes = endHour * 60 + endMinute;
      durationMinutes = endMinutes - startMinutes;
    }

    // Each hour is 96px, so each minute is 96/60 = 1.6px
    const offsetMinutes = (startHour - visibleHoursStart) * 60 + startMinute;
    const top = (offsetMinutes / 60) * 96;
    const height = (durationMinutes / 60) * 96 - 8;

    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card max-h-200 flex flex-col">
      {/* Day header */}
      <div className="border-b bg-muted/50 p-3 text-center shrink-0">
        <span className="text-sm font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
      </div>

      <div className="flex overflow-auto flex-1">
        {/* Time column */}
        <div className="w-20 border-r bg-muted/20 shrink-0">
          {hours.map((hour, index) => (
            <div key={hour} className="relative border-b" style={{ height: "96px" }}>
              {index !== 0 && (
                <div className="absolute -top-3 right-2 text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 relative">
          {/* Hour grid lines with working hours shading */}
          {hours.map((hour, index) => {
            const isWorking = isWorkingHour(selectedDate, hour, workingHours);
            return (
              <DroppableTimeBlock key={hour} date={selectedDate} hour={hour} minute={0}>
                <div
                  className={cn("border-b", !isWorking && "bg-muted/20")}
                  style={{ height: "96px" }}
                >
                  {index !== 0 && (
                    <div className="absolute inset-x-0 top-0 border-b border-dashed opacity-30" />
                  )}
                  {/* Half-hour line */}
                  <div className="absolute inset-x-0 top-1/2 border-b border-dashed opacity-20" />
                </div>
              </DroppableTimeBlock>
            );
          })}

          {/* Tasks with time */}
          <div className="absolute inset-0 px-2 pointer-events-none">
            {tasksWithTime.map((task) => {
              const style = getTaskStyle(task);
              const colorClasses = COLOR_CLASSES[task.color];

              return (
                <div
                  key={task.id}
                  className="absolute left-2 right-2 pointer-events-auto"
                  style={style}
                >
                  <DraggableTask task={task}>
                    <TaskDetailsDialog task={task}>
                      <button
                        className={cn(
                          "w-full px-3 py-2 rounded-md text-left text-sm border-l-4",
                          "hover:opacity-90 transition-opacity",
                          colorClasses.bg,
                          colorClasses.border
                        )}
                      >
                        {badgeVariant !== "colored" && (
                          <svg width="8" height="8" viewBox="0 0 8 8" className="inline mr-1.5">
                            <circle cx="4" cy="4" r="4" className={colorClasses.dot} />
                          </svg>
                        )}
                        <span className={cn("font-semibold truncate", colorClasses.text)}>
                          {task.title}
                        </span>
                        {task.startTime && task.endTime && (
                          <div className="text-xs mt-1 opacity-80">
                            {task.startTime} - {task.endTime}
                          </div>
                        )}
                      </button>
                    </TaskDetailsDialog>
                  </DraggableTask>
                </div>
              );
            })}
          </div>

          {/* Current time indicator */}
          {isSameDay(selectedDate, new Date()) && (
            <CurrentTimeIndicator visibleHoursStart={visibleHoursStart} />
          )}
        </div>
      </div>

      {/* Tasks without time */}
      {tasksWithoutTime.length > 0 && (
        <div className="border-t p-4 space-y-2 shrink-0">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">All Day Tasks</h3>
          {tasksWithoutTime.map((task) => {
            const colorClasses = COLOR_CLASSES[task.color];
            return (
              <DraggableTask key={task.id} task={task}>
                <TaskDetailsDialog task={task}>
                  <button
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md border-l-4",
                      "hover:opacity-90 transition-opacity",
                      colorClasses.bg,
                      colorClasses.border
                    )}
                  >
                    {badgeVariant !== "colored" && (
                      <svg width="8" height="8" viewBox="0 0 8 8" className="inline mr-1.5">
                        <circle cx="4" cy="4" r="4" className={colorClasses.dot} />
                      </svg>
                    )}
                    <span className={cn("font-medium", colorClasses.text)}>{task.title}</span>
                    {task.description && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {task.description}
                      </div>
                    )}
                  </button>
                </TaskDetailsDialog>
              </DraggableTask>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CurrentTimeIndicatorProps {
  visibleHoursStart: number;
}

function CurrentTimeIndicator({ visibleHoursStart }: CurrentTimeIndicatorProps) {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const offsetMinutes = minutes - visibleHoursStart * 60;
  const top = (offsetMinutes / 60) * 96;

  if (top < 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-50 border-t-2 border-primary"
      style={{ top: `${top}px` }}
    >
      <div className="absolute left-0 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      <div className="absolute left-2 -translate-y-1/2 text-xs font-medium text-primary">
        {format(now, "h:mm a")}
      </div>
    </div>
  );
}
