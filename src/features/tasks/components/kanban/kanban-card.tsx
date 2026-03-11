import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Flag, Calendar, ListTodo, GripVertical } from "lucide-react";
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-card p-3 shadow-sm transition-all",
        isDragging && "opacity-40",
        isDragOverlay && "shadow-lg ring-2 ring-primary/20 rotate-2",
        !isDragging && !isDragOverlay && "hover:shadow-md hover:border-primary/20"
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab opacity-0 group-hover:opacity-60 hover:!opacity-100 active:cursor-grabbing transition-opacity"
          tabIndex={-1}
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <button
            onClick={() => onTaskClick(task)}
            className="text-sm font-medium leading-snug text-left w-full truncate hover:text-primary transition-colors"
          >
            {task.title}
          </button>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Priority */}
            <Flag className={cn("size-3", priorityConfig.iconClass)} />

            {/* Due date */}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {task.dueDate}
              </span>
            )}

            {/* Subtask count */}
            {totalSubtasks > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
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
            "mt-0.5 size-4 rounded-full border-2 shrink-0 transition-all",
            task.status === "completed"
              ? "bg-[#e44232] border-[#e44232]"
              : "border-muted-foreground/30 hover:border-[#e44232]"
          )}
        />
      </div>
    </div>
  );
}
