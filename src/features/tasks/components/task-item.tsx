import * as React from "react";
import { format, isToday, isTomorrow, isPast, isThisWeek } from "date-fns";
import {
  Calendar,
  Pencil,
  Trash2,
  Flag,
  FolderKanban,
  Tag,
  RotateCcw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { TaskInlineEditor } from "@/features/tasks/components/task-inline-editor";
import type { CalendarTask } from "@/features/tasks/types/task.types";

export interface TaskItemProps {
  task: CalendarTask;
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (taskId: string, updates: Partial<CalendarTask>) => void;
  onRestore?: (task: CalendarTask) => void;
  onDelete?: (taskId: string) => void;
  onClick?: (task: CalendarTask) => void;
  showProject?: boolean;
  showCategory?: boolean;
  showRestore?: boolean;
  selectMode?: boolean;
  selected?: boolean;
  onSelect?: (taskId: string) => void;
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
        text: `Overdue \u00b7 ${format(date, "MMM d")}`,
        color: "text-red-500 bg-red-500/10 font-semibold",
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

function TaskItemInner({
  task,
  onToggleComplete,
  onEdit,
  onRestore,
  onDelete,
  onClick,
  showProject = true,
  showCategory = true,
  showRestore = false,
  selectMode = false,
  selected = false,
  onSelect,
  className,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null;
  const isCompleted = task.status === "completed";
  const hasDescription = Boolean(task.description && !task.description.includes("[AI Generated]"));

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectMode) {
      onSelect?.(task.id);
    } else {
      onToggleComplete?.(task.id);
    }
  };

  const enterEditMode = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (showRestore || isCompleted) return;
    setIsEditing(true);
  };

  const handleSave = (taskId: string, updates: Partial<CalendarTask>) => {
    onEdit?.(taskId, updates);
    setIsEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(task.id);
  };

  const handleTaskClick = () => {
    if (isEditing) return;
    if (selectMode) {
      onSelect?.(task.id);
    } else {
      onClick?.(task);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3",
        "border-border/50 bg-background/70 shadow-[0_0_0_1px_rgba(0,0,0,0.01)] transition-all duration-200",
        isEditing
          ? "border-brand/40 ring-2 ring-brand/20 bg-background shadow-lg"
          : "hover:-translate-y-px hover:border-border hover:bg-accent/40 hover:shadow-md",
        "focus-within:border-brand/35 focus-within:ring-2 focus-within:ring-brand/20",
        isCompleted && !isEditing && "opacity-60",
        selected && "border-brand/40 bg-brand/10 ring-1 ring-brand/20",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleTaskClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (isEditing) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTaskClick();
        }
      }}
    >
      {/* Single checkbox — selection or completion, never both */}
      {!isEditing && (
        <button
          onClick={handleCheckboxClick}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center transition-all",
            selectMode ? "rounded border-2" : "rounded-full border-2",
            selectMode && selected
              ? "bg-brand border-brand"
              : selectMode
                ? "border-muted-foreground/30 hover:border-brand"
                : isCompleted
                  ? "bg-brand border-brand"
                  : "border-muted-foreground/30 hover:border-brand"
          )}
          aria-label={
            selectMode
              ? selected ? "Deselect task" : "Select task"
              : isCompleted ? "Mark as incomplete" : "Mark as complete"
          }
        >
          {((selectMode && selected) || (!selectMode && isCompleted)) && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      )}

      {/* Task Content or Inline Editor */}
      {isEditing ? (
        <div className="min-w-0 flex-1">
          <TaskInlineEditor
            task={task}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            {/* Title row */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "text-sm font-semibold tracking-tight",
                  isCompleted && "line-through text-muted-foreground"
                )}
                onDoubleClick={(e) => { e.stopPropagation(); enterEditMode(); }}
              >
                {task.title}
              </span>

              {task.priority >= 3 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Flag
                        className={cn("h-3.5 w-3.5 fill-current", getPriorityColor(task.priority))}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Priority: {task.priority === 4 ? "Urgent" : "High"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {task.description?.includes("[AI Generated]") && (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                  <Sparkles className="h-3 w-3" />
                  AI
                </span>
              )}
            </div>

            {hasDescription && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/85">{task.description}</p>
            )}

            {/* Metadata Row — date, project, category */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              {dueDateInfo && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium",
                    dueDateInfo.color
                  )}
                >
                  {dueDateInfo.isPastDue ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : (
                    <Calendar className="h-3 w-3" />
                  )}
                  {dueDateInfo.text}
                </span>
              )}

              {showProject && task.project && (
                <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 font-medium text-violet-600 dark:text-violet-400">
                  <FolderKanban className="h-3 w-3" />
                  {task.project}
                </span>
              )}

              {showCategory && task.category && (
                <span className="inline-flex items-center gap-1 rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-medium text-cyan-600 dark:text-cyan-400">
                  <Tag className="h-3 w-3" />
                  {task.category}
                </span>
              )}
            </div>

            {/* Tags Row */}
            {task.tags && task.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium">Tags:</span>
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-2 rounded-lg border border-border/40 bg-muted/25 p-2.5">
                <span className="text-xs text-muted-foreground font-medium">
                  Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                </span>
                <div className="space-y-1 mt-1">
                  {task.subtasks.map((sub, i) => (
                    <div key={`subtask-${sub.title}-${i}`} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <div
                        className={cn(
                          "h-3.5 w-3.5 rounded-sm border shrink-0 mt-0.5 flex items-center justify-center",
                          sub.completed ? "bg-brand/20 border-brand/40" : "border-muted-foreground/30"
                        )}
                      >
                        {sub.completed && (
                          <svg className="w-2.5 h-2.5 text-brand" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className={cn("font-medium", sub.completed && "line-through")}>{sub.title}</span>
                        {sub.description && (
                          <p className="text-muted-foreground/70 mt-0.5">{sub.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons (visible on hover) — hidden in select mode and edit mode */}
          {!selectMode && (
            <div
              className={cn(
                "shrink-0 gap-1 transition-all duration-200 sm:flex",
                isHovered || isCompleted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {onRestore && showRestore && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-background hover:text-green-500"
                        onClick={(e) => { e.stopPropagation(); onRestore(task); }}
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span className="sr-only">Restore task</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Restore</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {onEdit && !showRestore && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-background hover:text-foreground"
                        onClick={enterEditMode}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit task</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit</p>
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
                        className="h-8 w-8 text-muted-foreground hover:bg-background hover:text-red-500"
                        onClick={handleDeleteClick}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">
                          {showRestore ? "Delete permanently" : "Delete task"}
                        </span>
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
        </>
      )}
    </div>
  );
}

export const TaskItem = React.memo(TaskItemInner);
