"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Loader2, FileText } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import type {
  CalendarTask,
  Subtask,
  TaskPriority,
  ReminderBefore,
  Recurrence,
} from "@/features/tasks/types/task.types";
import { TaskReminderToggle } from "@/features/reminders/components/task-reminder-toggle";
import { TemplatePicker } from "@/features/templates";
import type { TaskTemplate } from "@/features/templates";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useProjects } from "@/shared/hooks/use-projects";
import { useCategories } from "@/shared/hooks/use-categories";
import { autoSetPriority, hasAiKey } from "@/shared/services/ai.service";
import { logger } from "@/shared/lib/logger";
import {
  TaskSubtasksEditor,
  TaskTagsInput,
  TaskDescriptionInput,
  TaskMetadataRow,
} from "./task-form";

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
  onSave?: (task: Partial<CalendarTask>) => void | Promise<void>;
  onAddTask?: (task: EmptyStateTaskInput) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  defaultDate?: Date;
}

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
  const { user } = useAuth();
  const { projects: appProjects, addProject } = useProjects();
  const [isTemplatePickerOpen, setTemplatePickerOpen] = React.useState(false);
  const { categories: appCategories, addCategory } = useCategories();

  const projectOptions = React.useMemo(() => {
    const opts = appProjects.map((p) => ({ value: p.name, label: p.name }));
    return [{ value: "inbox", label: "Inbox" }, ...opts];
  }, [appProjects]);

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
  const [aiPrioritySet, setAiPrioritySet] = React.useState(false);
  const [reminderEnabled, setReminderEnabled] = React.useState(task?.reminderEnabled ?? false);
  const [reminderBefore, setReminderBefore] = React.useState<ReminderBefore>(
    task?.reminderBefore ?? "1h"
  );
  const [tags, setTags] = React.useState<string[]>(task?.tags || []);
  const [recurrence, setRecurrence] = React.useState<Recurrence | "">(task?.recurrence || "");

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDate(task.dueDate ? parseISO(task.dueDate) : undefined);
      setPriority(task.priority);
      setCategory(task.category || "");
      setProject(task.project || "");
      setSubtasks(task.subtasks || []);
      setTags(task.tags || []);
      setReminderEnabled(task.reminderEnabled ?? false);
      setReminderBefore(task.reminderBefore ?? "1h");
      setRecurrence(task.recurrence || "");
    }
  }, [task]);

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
    setAiPrioritySet(false);
    setTags([]);
    setReminderEnabled(false);
    setReminderBefore("1h");
    setRecurrence("");
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

  const handleAddCategory = async (label: string) => {
    try {
      await addCategory({ name: label });
      setCategory(label);
    } catch (err) {
      logger.error("Error creating category", { error: err });
    }
  };

  const handleSelectTemplate = (template: TaskTemplate) => {
    setTitle(template.title);
    setDescription(template.description || "");
    setPriority(template.priority);
    setCategory(template.category || "");
    setProject(template.project || "");
    setSubtasks(template.subtasks?.map((s) => ({ ...s, completed: false })) || []);
  };

  const handleAddProject = async (label: string) => {
    try {
      await addProject({ name: label });
      setProject(label);
    } catch (err) {
      logger.error("Error creating project", { error: err });
    }
  };

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);

    try {
      if (onAddTask) {
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
        const taskData: Partial<CalendarTask> = {
          ...(isEditMode && { id: task.id }),
          title: title.trim(),
          description: description.trim() || undefined,
          subtasks: subtasks.length > 0 ? subtasks : undefined,
          dueDate: date ? format(date, "yyyy-MM-dd") : undefined,
          priority,
          category: category.trim() || undefined,
          project: project.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
          status: task?.status || "todo",
          reminderEnabled: date ? reminderEnabled : false,
          reminderBefore: reminderEnabled && date ? reminderBefore : undefined,
          recurrence: recurrence || null,
        };
        await onSave(taskData);
      }

      resetForm();
      onOpenChange?.(false);
    } catch (err) {
      logger.error("Error saving task", { error: err });
    } finally {
      setIsSaving(false);
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
          <TaskDescriptionInput
            description={description}
            onDescriptionChange={setDescription}
            title={title}
          />

          {/* Sub-tasks */}
          <TaskSubtasksEditor subtasks={subtasks} onSubtasksChange={setSubtasks} />

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

          {/* Project, Priority, Category, Recurrence */}
          <TaskMetadataRow
            project={project}
            priority={priority}
            category={category}
            recurrence={recurrence}
            projectOptions={projectOptions}
            categoryOptions={categoryOptions}
            aiPrioritySet={aiPrioritySet}
            onProjectChange={setProject}
            onPriorityChange={setPriority}
            onCategoryChange={setCategory}
            onRecurrenceChange={setRecurrence}
            onAiPriorityReset={() => setAiPrioritySet(false)}
            onAddProject={handleAddProject}
            onAddCategory={handleAddCategory}
          />

          {/* Tags */}
          <div className="border-t pt-4 space-y-2">
            <TaskTagsInput tags={tags} onTagsChange={setTags} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 px-5 py-3 flex items-center justify-between bg-muted/20">
          {!isEditMode && user?.$id ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-sm text-muted-foreground gap-1.5"
              onClick={() => setTemplatePickerOpen(true)}
            >
              <FileText className="h-4 w-4" />
              Use Template
            </Button>
          ) : (
            <div />
          )}
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
              disabled={!title.trim() || isSaving}
              onClick={handleSave}
              className="h-9 px-4 text-sm font-semibold bg-brand hover:bg-brand-hover text-white"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditMode ? "Save changes" : "Add task"}
            </Button>
          </div>
        </div>

        {user?.$id && (
          <TemplatePicker
            open={isTemplatePickerOpen}
            onOpenChange={setTemplatePickerOpen}
            userId={user.$id}
            onSelect={handleSelectTemplate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
