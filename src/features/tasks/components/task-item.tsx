import * as React from "react";
import { format, isToday, isTomorrow, isPast, isThisWeek } from "date-fns";
import { Calendar, Pencil, Trash2, Flag, FolderKanban, Tag, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import type { CalendarTask } from "@/features/tasks/types/task.types";

export interface TaskItemProps {
  task: CalendarTask;
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (task: CalendarTask) => void;
  onDelete?: (taskId: string) => void;
  onClick?: (task: CalendarTask) => void;
  showProject?: boolean;
  showCategory?: boolean;
  showRestore?: boolean; // For trash view - shows restore button instead of edit
  className?: string;
}

const getPriorityColor = (priority: number): string => {
  switch (priority) {
    case 4:
      return "text-red-500";
    case 3:
      return "text-orange-500";
    case 2:
      return "text-yellow-500";
    case 1:
      return "text-blue-500";
    default:
      return "text-muted-foreground";
  }
};

const formatDueDate = (dueDate: string): { text: string; color: string; isPastDue: boolean } => {
  try {
    const date = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (isPast(taskDate) && taskDate < now) {
      return {
        text: format(date, "MMM d"),
        color: "text-red-500 bg-red-500/10",
        isPastDue: true,
      };
    }

    if (isToday(date)) {
      return {
        text: "Today",
        color: "text-green-500 bg-green-500/10",
        isPastDue: false,
      };
    }

    if (isTomorrow(date)) {
      return {
        text: "Tomorrow",
        color: "text-yellow-500 bg-yellow-500/10",
        isPastDue: false,
      };
    }

    if (isThisWeek(date, { weekStartsOn: 1 })) {
      return {
        text: format(date, "EEEE"),
        color: "text-blue-500 bg-blue-500/10",
        isPastDue: false,
      };
    }

    return {
      text: format(date, "MMM d"),
      color: "text-muted-foreground bg-muted",
      isPastDue: false,
    };
  } catch {
    return {
      text: dueDate,
      color: "text-muted-foreground bg-muted",
      isPastDue: false,
    };
  }
};

export function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
  showProject = true,
  showCategory = true,
  showRestore = false,
  className,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null;
  const isCompleted = task.status === "completed";

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete?.(task.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task.id);
  };

  const handleTaskClick = () => {
    onClick?.(task);
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent",
        "hover:border-border hover:bg-accent/50 transition-all duration-200 cursor-pointer",
        isCompleted && "opacity-60",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTaskClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTaskClick();
        }
      }}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheckboxClick}
        className={cn(
          "flex items-center justify-center h-5 w-5 rounded-full border-2 shrink-0 transition-all",
          isCompleted
            ? "bg-[#e44232] border-[#e44232]"
            : "border-muted-foreground/30 hover:border-[#e44232]"
        )}
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      >
        {isCompleted && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Title and metadata */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-sm font-medium",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </span>

          {/* Priority indicator */}
          {task.priority >= 3 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Flag className={cn("h-3.5 w-3.5 fill-current", getPriorityColor(task.priority))} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Priority: {task.priority === 4 ? "Urgent" : "High"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Due Date */}
          {dueDateInfo && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium",
                dueDateInfo.color
              )}
            >
              <Calendar className="h-3 w-3" />
              {dueDateInfo.text}
            </span>
          )}

          {/* Project */}
          {showProject && task.project && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 font-medium">
              <FolderKanban className="h-3 w-3" />
              {task.project}
            </span>
          )}

          {/* Category */}
          {showCategory && task.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500 font-medium">
              <Tag className="h-3 w-3" />
              {task.category}
            </span>
          )}

          {/* AI Generated tag */}
          {task.description?.includes("[AI Generated]") && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e44232]/10 text-[#e44232] font-medium">
              <Sparkles className="h-3 w-3" />
              AI
            </span>
          )}

          {/* Subtasks count */}
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="text-muted-foreground">
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtask{task.subtasks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons (visible on hover) */}
      {(isHovered || isCompleted) && (
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 text-muted-foreground",
                      showRestore ? "hover:text-green-500" : "hover:text-foreground"
                    )}
                    onClick={handleEditClick}
                  >
                    {showRestore ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                    <span className="sr-only">{showRestore ? "Restore task" : "Edit task"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showRestore ? "Restore" : "Edit"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {onDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{showRestore ? "Delete permanently" : "Delete task"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showRestore ? "Delete permanently" : "Delete"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
}
