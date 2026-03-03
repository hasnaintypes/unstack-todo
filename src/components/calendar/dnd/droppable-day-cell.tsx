"use client";

import { useDrop } from "react-dnd";
import { parseISO } from "date-fns";
import { useCalendar } from "@/context/calendar-context";
import { cn } from "@/lib/utils";
import type { CalendarTask } from "@/types/calendar";

interface DroppableDayCellProps {
  date: Date;
  children: React.ReactNode;
}

export function DroppableDayCell({ date, children }: DroppableDayCellProps) {
  const { updateTask } = useCalendar();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "task",
      drop: (item: { task: CalendarTask }) => {
        const droppedTask = item.task;

        const taskDueDate = parseISO(droppedTask.dueDate);
        const newDueDate = new Date(date);

        // Preserve the time if it exists
        if (droppedTask.startTime) {
          const [hours, minutes] = droppedTask.startTime.split(":").map(Number);
          newDueDate.setHours(
            hours,
            minutes,
            taskDueDate.getSeconds(),
            taskDueDate.getMilliseconds()
          );
        } else {
          newDueDate.setHours(
            taskDueDate.getHours(),
            taskDueDate.getMinutes(),
            taskDueDate.getSeconds(),
            taskDueDate.getMilliseconds()
          );
        }

        updateTask(droppedTask.id, {
          dueDate: newDueDate.toISOString(),
        });

        return { moved: true };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [date, updateTask]
  );

  return (
    <div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      className={cn(isOver && canDrop && "bg-accent/50")}
    >
      {children}
    </div>
  );
}
