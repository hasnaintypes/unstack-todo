import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Flag, Calendar, ListTodo, GripVertical, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getPriorityConfig } from "@/features/tasks/utils/task-helpers";
import type { CalendarTask } from "@/features/tasks/types/task.types";

interface KanbanCardProps {
  task: CalendarTask;
  onTaskClick: (task: CalendarTask) => void;
  onToggleComplete: (taskId: string) => void;
  isDragOverlay?: boolean;
}

export function KanbanCard({
  task,
  onTaskClick,
  onToggleComplete,
  isDragOverlay,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;
  const formattedDueDate = task.dueDate
    ? (() => {
        const date = new Date(task.dueDate);
        return Number.isNaN(date.getTime()) ? task.dueDate : format(date, "MMM d");
      })()
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-border/60 bg-background/85 p-3 shadow-sm transition-all",
        isDragging && "opacity-40",
        isDragOverlay && "rotate-2 border-primary/30 shadow-lg ring-2 ring-primary/20",
        !isDragging && !isDragOverlay && "hover:-translate-y-px hover:border-primary/20 hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-60 hover:opacity-100! hover:bg-muted active:cursor-grabbing"
          tabIndex={-1}
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onTaskClick(task);
            }}
            className="w-full cursor-pointer truncate text-left text-sm font-semibold leading-snug tracking-tight transition-colors hover:text-primary"
          >
            {task.title}
          </button>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/85">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {/* Priority */}
            <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/35 px-1.5 py-0.5 text-xs text-muted-foreground">
              <Flag className={cn("size-3", priorityConfig.iconClass)} />
              {priorityConfig.label}
            </span>

            {/* Due date */}
            {formattedDueDate && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/35 px-1.5 py-0.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {formattedDueDate}
              </span>
            )}

            {/* Subtask count */}
            {totalSubtasks > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/35 px-1.5 py-0.5 text-xs text-muted-foreground">
                <ListTodo className="size-3" />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
          </div>
        </div>

        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          className={cn(
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            task.status === "completed"
              ? "bg-brand border-brand"
              : "border-muted-foreground/30 hover:border-brand"
          )}
          aria-label={task.status === "completed" ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.status === "completed" && <Check className="size-2.5 text-white" />}
        </button>
      </div>
    </div>
  );
}
