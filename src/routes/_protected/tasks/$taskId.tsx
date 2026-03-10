import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Flag,
  Tag,
  FolderKanban,
  AlignLeft,
  ListTodo,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Separator } from "@/shared/components/ui/separator";
import { useTasks } from "@/app/providers/task-provider";
import { useProjects } from "@/app/providers/project-provider";
import { useCategories } from "@/app/providers/category-provider";
import { taskService } from "@/features/tasks/services/task.service";
import { getPriorityConfig } from "@/features/tasks/utils/task-helpers";
import { cn } from "@/shared/lib/utils";
import type {
  CalendarTask,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types/task.types";

export const Route = createFileRoute("/_protected/tasks/$taskId")({
  component: TaskDetailPage,
});

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const { tasks, isLoading, updateTask, toggleTaskComplete } = useTasks();
  const { projects } = useProjects();
  const { categories } = useCategories();
  const [fallbackTask, setFallbackTask] = useState<CalendarTask | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  const contextTask = tasks.find((t) => t.id === taskId);
  const task = contextTask || fallbackTask;

  // Fallback: fetch from Appwrite if not in context
  useEffect(() => {
    if (!isLoading && !contextTask && !fallbackTask && !fallbackLoading) {
      setFallbackLoading(true);
      taskService
        .getTask(taskId)
        .then(setFallbackTask)
        .catch(() => setFallbackTask(null))
        .finally(() => setFallbackLoading(false));
    }
  }, [isLoading, contextTask, fallbackTask, fallbackLoading, taskId]);

  const handleBack = () => {
    window.history.back();
  };

  const handleToggleComplete = () => {
    if (task) toggleTaskComplete(task.id);
  };

  // Inline field updates
  const saveTitle = () => {
    if (task && titleDraft.trim() && titleDraft.trim() !== task.title) {
      updateTask(task.id, { title: titleDraft.trim() });
    }
    setEditingTitle(false);
  };

  const saveDescription = () => {
    if (task) {
      const newDesc = descDraft.trim();
      if (newDesc !== (task.description || "")) {
        updateTask(task.id, { description: newDesc || undefined });
      }
    }
    setEditingDescription(false);
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    if (task) updateTask(task.id, { priority });
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (task) updateTask(task.id, { status });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (task) {
      updateTask(task.id, {
        dueDate: date ? format(date, "yyyy-MM-dd") : undefined,
      });
    }
  };

  const handleCategoryChange = (category: string) => {
    if (task) updateTask(task.id, { category: category || undefined });
  };

  const handleProjectChange = (project: string) => {
    if (task) updateTask(task.id, { project: project || undefined });
  };

  // Subtask handlers
  const handleToggleSubtask = (index: number) => {
    if (!task?.subtasks) return;
    const updated = task.subtasks.map((s, i) =>
      i === index ? { ...s, completed: !s.completed } : s
    );
    updateTask(task.id, { subtasks: updated });
  };

  const handleAddSubtask = () => {
    if (!task || !newSubtask.trim()) return;
    const updated = [
      ...(task.subtasks || []),
      { title: newSubtask.trim(), completed: false },
    ];
    updateTask(task.id, { subtasks: updated });
    setNewSubtask("");
  };

  const handleDeleteSubtask = (index: number) => {
    if (!task?.subtasks) return;
    const updated = task.subtasks.filter((_, i) => i !== index);
    updateTask(task.id, { subtasks: updated.length > 0 ? updated : undefined });
  };

  if (isLoading || fallbackLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">
          Loading task...
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-lg font-medium text-muted-foreground">
          Task not found
        </p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  const isCompleted = task.status === "completed";
  const priorityConfig = getPriorityConfig(task.priority);
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleComplete}
          className="gap-2"
        >
          {isCompleted ? (
            <>
              <Circle className="h-4 w-4" />
              Reopen
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </>
          )}
        </Button>
      </div>

      {/* Inline Title */}
      {editingTitle ? (
        <input
          ref={titleInputRef}
          autoFocus
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveTitle();
            if (e.key === "Escape") setEditingTitle(false);
          }}
          className="w-full text-2xl font-semibold leading-tight bg-transparent outline-none border-b-2 border-primary pb-1"
        />
      ) : (
        <h1
          className="text-2xl font-semibold leading-tight cursor-pointer hover:text-foreground/80 transition-colors"
          onClick={() => {
            setTitleDraft(task.title);
            setEditingTitle(true);
          }}
        >
          {task.title}
        </h1>
      )}

      {/* Detail Card */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        {/* Status */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
              task.status === "completed"
                ? "bg-green-500/10"
                : task.status === "in-progress"
                  ? "bg-blue-500/10"
                  : "bg-muted"
            )}
          >
            {task.status === "completed" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Status
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium hover:opacity-80 transition-opacity",
                      task.status === "completed" &&
                        "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
                      task.status === "in-progress" &&
                        "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
                      task.status === "todo" && "bg-muted"
                    )}
                  >
                    {STATUSES.find((s) => s.value === task.status)?.label}
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={() => handleStatusChange(s.value)}
                    className="cursor-pointer"
                  >
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator />

        {/* Due Date */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
            <CalendarIcon className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Due Date
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-sm font-medium hover:text-foreground/80 transition-colors cursor-pointer">
                  {task.dueDate
                    ? format(parseISO(task.dueDate), "EEEE, MMMM d, yyyy")
                    : "No due date — click to set"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={task.dueDate ? parseISO(task.dueDate) : undefined}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator />

        {/* Priority */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
              priorityConfig.bgClass
            )}
          >
            <Flag className={cn("h-5 w-5", priorityConfig.iconClass)} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Priority
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium hover:opacity-80 transition-opacity",
                      priorityConfig.badgeClass
                    )}
                  >
                    {priorityConfig.label}
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {PRIORITIES.map((p) => (
                  <DropdownMenuItem
                    key={p.value}
                    onClick={() => handlePriorityChange(p.value)}
                    className="cursor-pointer"
                  >
                    {p.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator />

        {/* Category */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
            <Tag className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Category
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium hover:text-foreground/80 transition-colors cursor-pointer">
                  {task.category || "None — click to set"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => handleCategoryChange("")}
                  className="cursor-pointer text-muted-foreground"
                >
                  None
                </DropdownMenuItem>
                {categories.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => handleCategoryChange(c.name)}
                    className="cursor-pointer"
                  >
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator />

        {/* Project */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
            <FolderKanban className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Project
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium hover:text-foreground/80 transition-colors cursor-pointer">
                  {task.project || "None — click to set"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => handleProjectChange("")}
                  className="cursor-pointer text-muted-foreground"
                >
                  None
                </DropdownMenuItem>
                {projects
                  .filter((p) => !p.isArchived)
                  .map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => handleProjectChange(p.name)}
                      className="cursor-pointer"
                    >
                      {p.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
            <AlignLeft className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Description
            </p>
            {editingDescription ? (
              <Textarea
                ref={descInputRef}
                autoFocus
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                onBlur={saveDescription}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setEditingDescription(false);
                }}
                className="min-h-24 resize-none text-sm leading-relaxed"
              />
            ) : (
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word cursor-pointer hover:text-foreground/80 transition-colors min-h-6"
                onClick={() => {
                  setDescDraft(task.description || "");
                  setEditingDescription(true);
                }}
              >
                {task.description || "No description — click to add"}
              </p>
            )}
          </div>
        </div>

        {/* Subtasks */}
        <Separator />
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
            <ListTodo className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Subtasks
              </p>
              {totalSubtasks > 0 && (
                <span className="text-xs text-muted-foreground">
                  {completedSubtasks}/{totalSubtasks} completed
                </span>
              )}
            </div>

            {/* Subtask list */}
            {task.subtasks && task.subtasks.length > 0 && (
              <ul className="space-y-2 mb-3">
                {task.subtasks.map((subtask, index) => (
                  <li key={index} className="flex items-center gap-2.5 group">
                    <button
                      onClick={() => handleToggleSubtask(index)}
                      className={cn(
                        "flex items-center justify-center h-4.5 w-4.5 rounded-full border-2 shrink-0 transition-all",
                        subtask.completed
                          ? "bg-[#e44232] border-[#e44232]"
                          : "border-muted-foreground/30 hover:border-[#e44232]"
                      )}
                    >
                      {subtask.completed && (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "text-sm leading-relaxed flex-1",
                        subtask.completed &&
                          "line-through text-muted-foreground"
                      )}
                    >
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add subtask */}
            {isAddingSubtask ? (
              <div className="flex items-center gap-2">
                <div className="h-4.5 w-4.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none"
                  placeholder="Subtask name"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddSubtask();
                    } else if (e.key === "Escape") {
                      setIsAddingSubtask(false);
                      setNewSubtask("");
                    }
                  }}
                  onBlur={() => {
                    if (newSubtask.trim()) handleAddSubtask();
                    setIsAddingSubtask(false);
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingSubtask(true)}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60 hover:text-[#e44232] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add subtask
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
