"use client";

import { useDrag } from "react-dnd";
import { useRef, useEffect } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";
import { cn } from "@/lib/utils";
import type { CalendarTask } from "@/types/calendar";

interface DraggableTaskProps {
  task: CalendarTask;
  children: React.ReactNode;
}

export function DraggableTask({ task, children }: DraggableTaskProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "task",
    item: () => {
      const width = ref.current?.offsetWidth || 0;
      const height = ref.current?.offsetHeight || 0;
      return { task, children, width, height };
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  // Hide the default drag preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
    drag(ref);
  }, [preview, drag]);

  return (
    <div ref={ref} className={cn(isDragging && "opacity-40")}>
      {children}
    </div>
  );
}
