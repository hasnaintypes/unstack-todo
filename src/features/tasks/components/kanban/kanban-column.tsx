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
    <div className="flex min-w-75 flex-1 flex-col rounded-xl border border-border/60 bg-card/70 shadow-sm">
      {/* Column header */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-background/70 px-3 py-3">
        <div className={cn("size-2.5 rounded-full", colorClass)} />
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <Badge variant="secondary" className="h-5 rounded-full px-1.5 text-xs">
          {tasks.length}
        </Badge>
      </div>

      {/* Column body */}
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-80 flex-1 space-y-2 rounded-b-xl border border-dashed p-2.5 transition-colors",
          isOver ? "border-primary/50 bg-primary/6" : "border-transparent"
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
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-xs text-muted-foreground/60">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
