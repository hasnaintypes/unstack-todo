import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { KanbanCard } from "./kanban-card";
import type { CalendarTask, TaskStatus } from "@/features/tasks/types/task.types";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: CalendarTask[];
  onTaskClick: (task: CalendarTask) => void;
  onToggleComplete: (taskId: string) => void;
  colorClass: string;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onTaskClick,
  onToggleComplete,
  colorClass,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="flex flex-col min-w-[280px] flex-1">
      {/* Column header */}
      <div className="flex items-center gap-2 px-2 py-3">
        <div className={cn("size-2.5 rounded-full", colorClass)} />
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="secondary" className="text-xs h-5 px-1.5 rounded-full">
          {tasks.length}
        </Badge>
      </div>

      {/* Column body */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-lg border border-dashed p-2 space-y-2 min-h-[200px] transition-colors",
          isOver ? "border-primary/50 bg-primary/5" : "border-transparent"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
