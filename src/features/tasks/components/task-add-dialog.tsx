"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Flag,
  Tag,
  AlignLeft,
  Plus,
  X,
  FolderKanban,
  Sparkles,
  Loader2,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import { TaskDropdownMenu } from "@/features/tasks/components/task-dropdown-menu";
import type { CalendarTask, Subtask, TaskPriority, ReminderBefore } from "@/features/tasks/types/task.types";
import { TaskReminderToggle } from "@/features/reminders/components/task-reminder-toggle";
import { useProjects } from "@/shared/hooks/use-projects";
import { useCategories } from "@/shared/hooks/use-categories";
import { autoSetPriority, generateDescription, hasAiKey } from "@/shared/services/ai.service";
import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

export interface EmptyStateTaskInput {
  title: string;
  description?: string;
  subtasks?: Subtask[];
  dueDate?: string;
  priority?: string;
  category?: string;
  project?: string;
}

export interface TaskAddDialogProps {
  task?: CalendarTask;
  onSave?: (task: Partial<CalendarTask>) => void;
  onAddTask?: (task: EmptyStateTaskInput) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  defaultDate?: Date;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" },
];


export function TaskAddDialog({
  task,
  onSave,
  onAddTask,
  open,
  onOpenChange,
  trigger,
  defaultDate,
}: TaskAddDialogProps) {
  const isEditMode = !!task;
  const { projects: appProjects, addProject } = useProjects();
  const { categories: appCategories, addCategory } = useCategories();

  // Build project options from real data
  const projectOptions = React.useMemo(() => {
    const opts = appProjects.map((p) => ({ value: p.name, label: p.name }));
    return [{ value: "inbox", label: "Inbox" }, ...opts];
  }, [appProjects]);

  // Build category options from real Appwrite data
  const categoryOptions = React.useMemo(() => {
    return appCategories.map((c) => ({ value: c.name, label: c.name }));
  }, [appCategories]);

  const [title, setTitle] = React.useState(task?.title || "");
  const [description, setDescription] = React.useState(task?.description || "");
  const [date, setDate] = React.useState<Date | undefined>(
    task?.dueDate ? parseISO(task.dueDate) : defaultDate
  );
  const [priority, setPriority] = React.useState<TaskPriority>(task?.priority || 2);
  const [category, setCategory] = React.useState(task?.category || "");
  const [project, setProject] = React.useState(task?.project || "");
  const [subtasks, setSubtasks] = React.useState<Subtask[]>(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = React.useState("");
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);
  const [aiPrioritySet, setAiPrioritySet] = React.useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = React.useState(false);
  const [reminderEnabled, setReminderEnabled] = React.useState(task?.reminderEnabled ?? false);
  const [reminderBefore, setReminderBefore] = React.useState<ReminderBefore>(task?.reminderBefore ?? "1h");

  // Update form when task changes
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDate(task.dueDate ? parseISO(task.dueDate) : undefined);
      setPriority(task.priority);
      setCategory(task.category || "");
      setProject(task.project || "");
      setSubtasks(task.subtasks || []);
      setReminderEnabled(task.reminderEnabled ?? false);
      setReminderBefore(task.reminderBefore ?? "1h");
    }
  }, [task]);

  // Sync defaultDate when it changes and not in edit mode
  React.useEffect(() => {
    if (!task && defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate, task]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(defaultDate);
    setPriority(2);
    setCategory("");
    setProject("");
    setSubtasks([]);
    setIsAddingSubtask(false);
    setAiPrioritySet(false);
    setReminderEnabled(false);
    setReminderBefore("1h");
  };

  const handleTitleBlur = async () => {
    if (isEditMode || !hasAiKey() || !title.trim()) return;
    try {
      const suggested = await autoSetPriority(title.trim());
      setPriority(suggested);
      setAiPrioritySet(true);
    } catch {
      // silently fail
    }
  };

  const handleGenerateDescription = async () => {
    if (!hasAiKey() || !title.trim() || isGeneratingDesc) return;
    setIsGeneratingDesc(true);
    try {
      const desc = await generateDescription(title.trim());
      if (desc) setDescription(desc);
    } catch {
      // silently fail
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAddCategory = async (label: string) => {
    try {
      await addCategory({ name: label });
      setCategory(label);
    } catch (err) {
      console.error("Error creating category:", err);
    }
  };

  const handleAddProject = async (label: string) => {
    try {
      await addProject({ name: label });
      setProject(label);
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;

    if (onAddTask) {
      // For empty state components using EmptyStateTaskInput
      const emptyStateTask: EmptyStateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        dueDate: date ? format(date, "PPP") : undefined,
        priority: priority.toString(),
        category: category.trim() || undefined,
        project: project.trim() || undefined,
      };
      onAddTask(emptyStateTask);
    } else if (onSave) {
      // For calendar components using CalendarTask
      const taskData: Partial<CalendarTask> = {
        ...(isEditMode && { id: task.id }),
        title: title.trim(),
        description: description.trim() || undefined,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        dueDate: date ? format(date, "yyyy-MM-dd") : undefined,
        priority,
        category: category.trim() || undefined,
        project: project.trim() || undefined,
        status: task?.status || "todo",
        reminderEnabled: date ? reminderEnabled : false,
        reminderBefore: reminderEnabled && date ? reminderBefore : undefined,
      };
      onSave(taskData);
    }

    if (isEditMode) {
      onOpenChange?.(false);
    } else {
      resetForm();
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { title: newSubtask.trim(), completed: false }]);
      setNewSubtask("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-175 p-0 gap-0 border-none overflow-hidden bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{isEditMode ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Task Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Task name"
            className="w-full bg-transparent px-0 text-xl font-semibold outline-none placeholder:text-muted-foreground/40"
            autoFocus
          />

          {/* Description */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1 shrink-0 mt-2">
              <AlignLeft className="h-5 w-5 text-muted-foreground/60" />
              {hasAiKey() && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={!title.trim() || isGeneratingDesc}
                        className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground/60 hover:text-[#e44232] hover:bg-[#e44232]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isGeneratingDesc ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Generate description with AI</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="min-h-25 resize-none border-none bg-transparent p-2 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 leading-relaxed"
            />
          </div>

          {/* Sub-tasks Section */}
          <div className="space-y-2">
            {subtasks.map((subtask, index) => (
              <div key={index} className="group flex items-center gap-3 pl-8 text-sm">
                <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                <span className="flex-1 text-foreground/80">{subtask.title}</span>
                <button onClick={() => setSubtasks(subtasks.filter((_, i) => i !== index))}>
                  <X className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            ))}

            {isAddingSubtask ? (
              <div className="flex items-center gap-3 pl-8">
                <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none"
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
                    if (newSubtask.trim()) {
                      handleAddSubtask();
                    }
                    setIsAddingSubtask(false);
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingSubtask(true)}
                className="flex items-center gap-2 pl-8 text-xs font-medium text-muted-foreground/60 hover:text-[#e44232] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add sub-task
              </button>
            )}
          </div>

          {/* Date Row */}
          <div className="border-t pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 gap-2 px-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {date ? format(date, "MMM dd, yyyy") : "Due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
              {date && (
                <TaskReminderToggle
                  enabled={reminderEnabled}
                  reminderBefore={reminderBefore}
                  onToggle={setReminderEnabled}
                  onReminderBeforeChange={setReminderBefore}
                />
              )}
            </div>
          </div>

          {/* Project, Priority and Category Row */}
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <TaskDropdownMenu
              icon={<FolderKanban className="h-4 w-4" />}
              placeholder="Project"
              value={project}
              options={projectOptions}
              onValueChange={setProject}
              onAddOption={handleAddProject}
              showAddOption
              addOptionLabel="Add project"
              addDialogTitle="Create New Project"
              addDialogDescription="Add a new project to organize your tasks."
            />

            <Separator orientation="vertical" className="h-6" />

            <div className="relative">
              <TaskDropdownMenu
                icon={<Flag className={cn("h-4 w-4", aiPrioritySet && "text-[#e44232]")} />}
                placeholder="Priority"
                value={priority.toString()}
                options={PRIORITIES.map((p) => ({ value: p.value.toString(), label: p.label }))}
                onValueChange={(val) => {
                  setPriority(parseInt(val) as TaskPriority);
                  setAiPrioritySet(false);
                }}
              />
              {aiPrioritySet && (
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-[#e44232]" />
              )}
            </div>

            <Separator orientation="vertical" className="h-6" />

            <TaskDropdownMenu
              icon={<Tag className="h-4 w-4" />}
              placeholder="Category"
              value={category}
              options={categoryOptions}
              onValueChange={setCategory}
              onAddOption={handleAddCategory}
              showAddOption
              addOptionLabel="Add category"
              addDialogTitle="Create New Category"
              addDialogDescription="Add a new category to group your tasks."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 px-5 py-3 flex items-center justify-end bg-muted/20">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 text-sm font-semibold"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!title.trim()}
              onClick={handleSave}
              className="h-9 px-4 text-sm font-semibold bg-[#e44232] hover:bg-[#c3392b] text-white"
            >
              {isEditMode ? "Save changes" : "Add task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
