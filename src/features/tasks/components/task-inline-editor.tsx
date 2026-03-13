import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Flag,
  Tag,
  AlignLeft,
  Plus,
  X,
  Check,
  FolderKanban,
  Repeat,
  CircleDot,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Separator } from "@/shared/components/ui/separator";
import { TaskDropdownMenu } from "@/features/tasks/components/task-dropdown-menu";
import { TaskReminderToggle } from "@/features/reminders/components/task-reminder-toggle";
import { useProjects } from "@/shared/hooks/use-projects";
import { useCategories } from "@/shared/hooks/use-categories";
import { cn } from "@/shared/lib/utils";
import { logger } from "@/shared/lib/logger";
import type {
  CalendarTask,
  Subtask,
  TaskPriority,
  TaskStatus,
  ReminderBefore,
  Recurrence,
} from "@/features/tasks/types/task.types";

interface TaskInlineEditorProps {
  task: CalendarTask;
  onSave: (taskId: string, updates: Partial<CalendarTask>) => void;
  onCancel: () => void;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" },
];

export function TaskInlineEditor({ task, onSave, onCancel }: TaskInlineEditorProps) {
  const { projects: appProjects, addProject } = useProjects();
  const { categories: appCategories, addCategory } = useCategories();

  const [title, setTitle] = React.useState(task.title);
  const [status, setStatus] = React.useState<TaskStatus>(task.status);
  const [description, setDescription] = React.useState(task.description || "");
  const [date, setDate] = React.useState<Date | undefined>(
    task.dueDate ? parseISO(task.dueDate) : undefined
  );
  const [priority, setPriority] = React.useState<TaskPriority>(task.priority);
  const [category, setCategory] = React.useState(task.category || "");
  const [project, setProject] = React.useState(task.project || "");
  const [subtasks, setSubtasks] = React.useState<Subtask[]>(task.subtasks || []);
  const [tags, setTags] = React.useState<string[]>(task.tags || []);
  const [tagInput, setTagInput] = React.useState("");
  const [recurrence, setRecurrence] = React.useState<Recurrence | "">(task.recurrence || "");
  const [reminderEnabled, setReminderEnabled] = React.useState(task.reminderEnabled ?? false);
  const [reminderBefore, setReminderBefore] = React.useState<ReminderBefore>(
    task.reminderBefore ?? "1h"
  );
  const [newSubtask, setNewSubtask] = React.useState("");
  const [newSubtaskDesc, setNewSubtaskDesc] = React.useState("");
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);

  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const projectOptions = React.useMemo(() => {
    const opts = appProjects.map((p) => ({ value: p.name, label: p.name }));
    return [{ value: "inbox", label: "Inbox" }, ...opts];
  }, [appProjects]);

  const categoryOptions = React.useMemo(() => {
    return appCategories.map((c) => ({ value: c.name, label: c.name }));
  }, [appCategories]);

  const handleAddProject = async (label: string) => {
    try {
      await addProject({ name: label });
      setProject(label);
    } catch (err) {
      logger.error("Error creating project", { error: err });
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

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        {
          title: newSubtask.trim(),
          description: newSubtaskDesc.trim() || undefined,
          completed: false,
        },
      ]);
      setNewSubtask("");
      setNewSubtaskDesc("");
    }
  };

  const toggleSubtaskComplete = (index: number) => {
    setSubtasks(
      subtasks.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s))
    );
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const addTag = (value: string) => {
    const newTag = value.trim().replace(/,$/, "");
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput("");
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const updates: Partial<CalendarTask> = {
      title: title.trim(),
      status,
      description: description.trim() || undefined,
      dueDate: date ? format(date, "yyyy-MM-dd") : "",
      priority,
      category: category.trim() || undefined,
      project: project.trim() || undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      tags: tags.length > 0 ? tags : undefined,
      recurrence: recurrence || null,
      reminderEnabled: date ? reminderEnabled : false,
      reminderBefore: reminderEnabled && date ? reminderBefore : undefined,
    };

    onSave(task.id, updates);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <div
      className="w-full space-y-3"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      {/* Header with Save/Cancel */}
      <div className="flex items-center justify-between gap-2">
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task name"
          className="flex-1 bg-transparent text-sm font-semibold tracking-tight outline-none border-b-2 border-brand py-1 placeholder:text-muted-foreground/40"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
        />
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-green-600 hover:bg-green-500/10 hover:text-green-700"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Save</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="flex gap-2">
        <AlignLeft className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-2" />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="min-h-16 resize-none border-border/50 bg-muted/20 p-2 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-brand/30 placeholder:text-muted-foreground/50 leading-relaxed"
        />
      </div>

      {/* Subtasks */}
      <div className="space-y-1.5">
        {subtasks.map((subtask, index) => (
          <div key={`subtask-${index}`} className="group/sub flex items-start gap-2 text-xs">
            <button
              onClick={() => toggleSubtaskComplete(index)}
              className={cn(
                "h-3.5 w-3.5 rounded-sm border shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                subtask.completed
                  ? "bg-brand/20 border-brand/40"
                  : "border-muted-foreground/30 hover:border-brand"
              )}
            >
              {subtask.completed && (
                <svg className="w-2.5 h-2.5 text-brand" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <span className={cn("text-foreground/80 font-medium", subtask.completed && "line-through text-muted-foreground")}>
                {subtask.title}
              </span>
              {subtask.description && (
                <p className="text-muted-foreground/70 mt-0.5">{subtask.description}</p>
              )}
            </div>
            <button
              onClick={() => removeSubtask(index)}
              className="opacity-0 group-hover/sub:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-red-500" />
            </button>
          </div>
        ))}

        {isAddingSubtask ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-sm border border-muted-foreground/30 shrink-0" />
              <input
                autoFocus
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
                placeholder="Subtask title"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddSubtask();
                  } else if (e.key === "Escape") {
                    e.stopPropagation();
                    setIsAddingSubtask(false);
                    setNewSubtask("");
                    setNewSubtaskDesc("");
                  }
                }}
              />
            </div>
            <input
              className="flex-1 bg-transparent text-xs text-muted-foreground outline-none pl-5.5 w-full placeholder:text-muted-foreground/40"
              placeholder="Description (optional)"
              value={newSubtaskDesc}
              onChange={(e) => setNewSubtaskDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddSubtask();
                } else if (e.key === "Escape") {
                  e.stopPropagation();
                  setIsAddingSubtask(false);
                  setNewSubtask("");
                  setNewSubtaskDesc("");
                }
              }}
              onBlur={() => {
                if (newSubtask.trim()) handleAddSubtask();
                else {
                  setIsAddingSubtask(false);
                  setNewSubtaskDesc("");
                }
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAddingSubtask(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/60 hover:text-brand transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add sub-task
          </button>
        )}
      </div>

      {/* Metadata Row — date, priority, project, category, recurrence */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:bg-accent"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {date ? format(date, "MMM dd") : "Due date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>

        {date && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground/50 hover:text-red-500"
              onClick={() => { setDate(undefined); setReminderEnabled(false); }}
            >
              <X className="h-3 w-3" />
            </Button>
            <TaskReminderToggle
              enabled={reminderEnabled}
              reminderBefore={reminderBefore}
              onToggle={setReminderEnabled}
              onReminderBeforeChange={setReminderBefore}
            />
          </>
        )}

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        <TaskDropdownMenu
          icon={<CircleDot className={cn("h-3.5 w-3.5", status === "completed" ? "text-green-500" : status === "in-progress" ? "text-blue-500" : "text-muted-foreground")} />}
          placeholder="Status"
          value={status}
          options={[
            { value: "todo", label: "To Do" },
            { value: "in-progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
          ]}
          onValueChange={(val) => setStatus(val as TaskStatus)}
          className="h-7 px-2 text-xs"
        />

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        <TaskDropdownMenu
          icon={<Flag className="h-3.5 w-3.5" />}
          placeholder="Priority"
          value={priority.toString()}
          options={PRIORITIES.map((p) => ({ value: p.value.toString(), label: p.label }))}
          onValueChange={(val) => setPriority(parseInt(val) as TaskPriority)}
          className="h-7 px-2 text-xs"
        />

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        <TaskDropdownMenu
          icon={<FolderKanban className="h-3.5 w-3.5" />}
          placeholder="Project"
          value={project}
          options={projectOptions}
          onValueChange={setProject}
          onAddOption={handleAddProject}
          showAddOption
          addOptionLabel="Add project"
          addDialogTitle="Create New Project"
          addDialogDescription="Add a new project to organize your tasks."
          className="h-7 px-2 text-xs"
        />

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        <TaskDropdownMenu
          icon={<Tag className="h-3.5 w-3.5" />}
          placeholder="Category"
          value={category}
          options={categoryOptions}
          onValueChange={setCategory}
          onAddOption={handleAddCategory}
          showAddOption
          addOptionLabel="Add category"
          addDialogTitle="Create New Category"
          addDialogDescription="Add a new category to group your tasks."
          className="h-7 px-2 text-xs"
        />

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        <TaskDropdownMenu
          icon={<Repeat className={cn("h-3.5 w-3.5", recurrence && "text-brand")} />}
          placeholder="Repeat"
          value={recurrence}
          options={[
            { value: "", label: "No repeat" },
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "weekdays", label: "Weekdays" },
          ]}
          onValueChange={(val) => setRecurrence(val as Recurrence | "")}
          className="h-7 px-2 text-xs"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-3">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-xs font-medium"
          >
            {tag}
            <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="hover:text-indigo-700">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                e.preventDefault();
                e.stopPropagation();
                addTag(tagInput);
              }
            }}
            onBlur={() => {
              if (tagInput.trim()) addTag(tagInput);
            }}
            placeholder="Add tags (Enter or comma)"
            className="bg-transparent text-xs outline-none placeholder:text-muted-foreground/40 w-40"
          />
        </div>
      </div>
    </div>
  );
}
