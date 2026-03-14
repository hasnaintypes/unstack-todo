import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TaskItem } from "@/features/tasks/components/task-item";
import type { CalendarTask } from "@/features/tasks/types/task.types";

interface VirtualizedTaskListProps {
  tasks: CalendarTask[];
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (taskId: string, updates: Partial<CalendarTask>) => void;
  onRestore?: (task: CalendarTask) => void;
  onDelete?: (taskId: string) => void;
  onTaskClick?: (task: CalendarTask) => void;
  showProject?: boolean;
  showCategory?: boolean;
  showRestore?: boolean;
  selectMode?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (taskId: string) => void;
}

export function VirtualizedTaskList({
  tasks,
  onToggleComplete,
  onEdit,
  onRestore,
  onDelete,
  onTaskClick,
  showProject = true,
  showCategory = true,
  showRestore = false,
  selectMode = false,
  selectedIds = new Set(),
  onSelect,
}: VirtualizedTaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="max-h-[calc(100vh-20rem)] overflow-auto"
    >
      <div
        className="relative w-full space-y-2"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const task = tasks[virtualRow.index];
          return (
            <div
              key={task.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 w-full"
              style={{ top: `${virtualRow.start}px` }}
            >
              <TaskItem
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onRestore={onRestore}
                onDelete={onDelete}
                onClick={onTaskClick}
                showProject={showProject}
                showCategory={showCategory}
                showRestore={showRestore}
                selectMode={selectMode}
                selected={selectedIds.has(task.id)}
                onSelect={onSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
