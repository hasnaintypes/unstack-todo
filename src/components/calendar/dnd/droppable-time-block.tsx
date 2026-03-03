"use client";

import { useDrop } from "react-dnd";
import { useCalendar } from "@/context/calendar-context";
import { cn } from "@/lib/utils";
import type { CalendarTask } from "@/types/calendar";

interface DroppableTimeBlockProps {
  date: Date;
  hour: number;
  minute: number;
  children: React.ReactNode;
}

export function DroppableTimeBlock({ date, hour, minute, children }: DroppableTimeBlockProps) {
  const { updateTask } = useCalendar();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "task",
      drop: (item: { task: CalendarTask }) => {
        const droppedTask = item.task;

        const newDueDate = new Date(date);
        newDueDate.setHours(hour, minute, 0, 0);

        // Calculate duration if task has start and end times
        let newEndTime: string | undefined;
        if (droppedTask.startTime && droppedTask.endTime) {
          const [startHour, startMin] = droppedTask.startTime.split(":").map(Number);
          const [endHour, endMin] = droppedTask.endTime.split(":").map(Number);
          const durationMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);

          const newEndHour = Math.floor((hour * 60 + minute + durationMinutes) / 60);
          const newEndMin = (hour * 60 + minute + durationMinutes) % 60;
          newEndTime = `${String(newEndHour).padStart(2, "0")}:${String(newEndMin).padStart(2, "0")}`;
        }

        updateTask(droppedTask.id, {
          dueDate: newDueDate.toISOString(),
          startTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
          endTime: newEndTime,
        });

        return { moved: true };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [date, hour, minute, updateTask]
  );

  return (
    <div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      className={cn("h-24", isOver && canDrop && "bg-accent/50")}
    >
      {children}
    </div>
  );
}
