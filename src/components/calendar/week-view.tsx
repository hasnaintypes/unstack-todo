import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { useCalendar } from "@/context/calendar-context";
import { isWorkingHour } from "@/lib/calendar-helpers";
import { cn } from "@/lib/utils";
import { TaskDetailsDialog, DraggableTask } from "@/components/task";
import { DroppableTimeBlock } from "./dnd/droppable-time-block";
import type { CalendarTask, TaskColor } from "@/types/calendar";

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

export function WeekView() {
  const { selectedDate, tasks, badgeVariant, workingHours, visibleHoursStart, visibleHoursEnd } =
    useCalendar();

  // Get week days
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Generate only visible hours
  const allHours = Array.from({ length: 24 }, (_, i) => i);
  const hours = allHours.filter((h) => h >= visibleHoursStart && h < visibleHoursEnd);

  // Get task position and style for a specific day
  const getTaskStyle = (task: CalendarTask) => {
    if (!task.startTime) return {};

    const [startHour, startMinute] = task.startTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;

    let durationMinutes = 60;
    if (task.endTime) {
      const [endHour, endMinute] = task.endTime.split(":").map(Number);
      const endMinutes = endHour * 60 + endMinute;
      durationMinutes = endMinutes - startMinutes;
    }

    const offsetMinutes = (startHour - visibleHoursStart) * 60 + startMinute;
    const top = (offsetMinutes / 60) * 96;
    const height = Math.max((durationMinutes / 60) * 96 - 8, 30);

    return { top: `${top}px`, height: `${height}px` };
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => isSameDay(parseISO(task.dueDate), day));
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card max-h-200 flex flex-col">
      {/* Week header */}
      <div className="flex border-b bg-muted/50 shrink-0">
        <div className="w-20 border-r shrink-0" />
        <div className="flex flex-1">
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="flex-1 p-3 text-center border-r last:border-r-0"
            >
              <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
              <div
                className={cn(
                  "mt-1 mx-auto size-8 flex items-center justify-center rounded-full text-sm font-semibold",
                  isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
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

        {/* Week grid */}
        <div className="flex flex-1">
          {weekDays.map((day, dayIndex) => {
            const dayTasks = getTasksForDay(day).filter((t) => t.startTime);
            const isToday = isSameDay(day, new Date());

            return (
              <div key={dayIndex} className="relative flex-1 border-r last:border-r-0">
                {/* Hour grid lines with working hours shading */}
                {hours.map((hour, index) => {
                  const isWorking = isWorkingHour(day, hour, workingHours);
                  return (
                    <DroppableTimeBlock key={hour} date={day} hour={hour} minute={0}>
                      <div
                        className={cn(
                          "border-b",
                          isToday && "bg-primary/5",
                          !isWorking && !isToday && "bg-muted/20"
                        )}
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

                {/* Tasks */}
                <div className="absolute inset-0 px-1 pointer-events-none">
                  {dayTasks.map((task) => {
                    const style = getTaskStyle(task);
                    const colorClasses = COLOR_CLASSES[task.color];
                    const taskDuration =
                      task.endTime && task.startTime
                        ? (() => {
                            const [sh, sm] = task.startTime.split(":").map(Number);
                            const [eh, em] = task.endTime.split(":").map(Number);
                            return eh * 60 + em - (sh * 60 + sm);
                          })()
                        : 60;

                    return (
                      <div
                        key={task.id}
                        className="absolute inset-x-1 pointer-events-auto"
                        style={style}
                      >
                        <DraggableTask task={task}>
                          <TaskDetailsDialog task={task}>
                            <button
                              className={cn(
                                "w-full px-2 py-1 rounded text-left truncate",
                                "border-l-2 hover:opacity-90 transition-opacity",
                                colorClasses.bg,
                                colorClasses.border
                              )}
                            >
                              {badgeVariant !== "colored" && (
                                <svg width="8" height="8" viewBox="0 0 8 8" className="inline mr-1">
                                  <circle cx="4" cy="4" r="4" className={colorClasses.dot} />
                                </svg>
                              )}
                              <span
                                className={cn("text-xs font-semibold truncate", colorClasses.text)}
                              >
                                {task.title}
                              </span>
                              {taskDuration > 30 && task.startTime && (
                                <div className="text-[10px] mt-0.5 opacity-70">
                                  {task.startTime}
                                </div>
                              )}
                            </button>
                          </TaskDetailsDialog>
                        </DraggableTask>
                      </div>
                    );
                  })}
                </div>

                {/* Current time indicator for today */}
                {isToday && <CurrentTimeIndicator visibleHoursStart={visibleHoursStart} />}
              </div>
            );
          })}
        </div>
      </div>
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
      <div className="absolute left-0 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
    </div>
  );
}
