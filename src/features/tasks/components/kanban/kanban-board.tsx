import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import type { CalendarTask, TaskStatus } from "@/features/tasks/types/task.types";

interface KanbanBoardProps {
  tasks: CalendarTask[];
  onUpdateTask: (taskId: string, updates: Partial<CalendarTask>) => void;
  onTaskClick: (task: CalendarTask) => void;
  onToggleComplete: (taskId: string) => void;
}

const COLUMNS: { id: TaskStatus; title: string; colorClass: string }[] = [
  { id: "todo", title: "To Do", colorClass: "bg-muted-foreground" },
  { id: "in-progress", title: "In Progress", colorClass: "bg-blue-500" },
  { id: "completed", title: "Completed", colorClass: "bg-green-500" },
];

export function KanbanBoard({ tasks, onUpdateTask, onTaskClick, onToggleComplete }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<CalendarTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, CalendarTask[]> = {
      "todo": [],
      "in-progress": [],
      "completed": [],
    };
    for (const task of tasks) {
      const status = task.status || "todo";
      if (grouped[status]) {
        grouped[status].push(task);
      } else {
        grouped["todo"].push(task);
      }
    }
    return grouped;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = () => {
    // Could add visual feedback here
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Determine target column: over could be a column ID or a task ID
    let targetStatus: TaskStatus | null = null;

    if (COLUMNS.some((col) => col.id === overId)) {
      targetStatus = overId as TaskStatus;
    } else {
      // Dropped over another task — find that task's status
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (!targetStatus) return;

    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === targetStatus) return;

    onUpdateTask(taskId, { status: targetStatus });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            colorClass={column.colorClass}
            tasks={tasksByStatus[column.id]}
            onTaskClick={onTaskClick}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <KanbanCard
            task={activeTask}
            onTaskClick={() => {}}
            onToggleComplete={() => {}}
            isDragOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
