import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  CircleDot,
  Flag,
  Tag,
  FolderKanban,
  AlignLeft,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { TaskDropdownMenu } from "./task-dropdown-menu";
import { TaskSubtasksEditor, TaskTagsInput } from "./task-form";
import { cn } from "@/shared/lib/utils";
import type { CalendarTask, Subtask, TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";

interface DropdownOption {
  value: string;
  label: string;
}

interface TaskDetailEditFormProps {
  task: CalendarTask;
  projectOptions: DropdownOption[];
  categoryOptions: DropdownOption[];
  onSave: (taskId: string, data: Partial<CalendarTask>) => void;
  onCancel: () => void;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" },
];

export function TaskDetailEditForm({
  task,
  projectOptions,
  categoryOptions,
  onSave,
  onCancel,
}: TaskDetailEditFormProps) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editStatus, setEditStatus] = useState<TaskStatus>(task.status);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [editDate, setEditDate] = useState<Date | undefined>(
    task.dueDate ? parseISO(task.dueDate) : undefined
  );
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority);
  const [editCategory, setEditCategory] = useState(task.category || "");
  const [editProject, setEditProject] = useState(task.project || "");
  const [editTags, setEditTags] = useState<string[]>(task.tags ? [...task.tags] : []);
  const [editSubtasks, setEditSubtasks] = useState<Subtask[]>(
    task.subtasks ? [...task.subtasks] : []
  );

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onSave(task.id, {
      title: editTitle.trim(),
      status: editStatus,
      description: editDescription.trim() || undefined,
      dueDate: editDate ? format(editDate, "yyyy-MM-dd") : undefined,
      priority: editPriority,
      category: editCategory.trim() || undefined,
      project: editProject.trim() || undefined,
      tags: editTags.length > 0 ? editTags : undefined,
      subtasks: editSubtasks.length > 0 ? editSubtasks : undefined,
    });
  };

  return (
    <div className="space-y-4 px-5 pb-5 pt-4">
      {/* Title */}
      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/40 p-3.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Title
        </label>
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Task name"
          autoFocus
        />
      </div>

      {/* Status */}
      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/40 p-3.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <CircleDot className="size-3.5" />
          Status
        </label>
        <TaskDropdownMenu
          icon={
            <CircleDot
              className={cn(
                "h-4 w-4",
                editStatus === "completed"
                  ? "text-green-500"
                  : editStatus === "in-progress"
                    ? "text-blue-500"
                    : "text-muted-foreground"
              )}
            />
          }
          placeholder="Status"
          value={editStatus}
          options={[
            { value: "todo", label: "To Do" },
            { value: "in-progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
          ]}
          onValueChange={(val) => setEditStatus(val as TaskStatus)}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/40 p-3.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <AlignLeft className="size-3.5" />
          Description
        </label>
        <Textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Add a description..."
          className="min-h-24 resize-none"
        />
      </div>

      {/* Due Date */}
      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/40 p-3.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <CalendarIcon className="size-3.5" />
          Due Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-9"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {editDate ? format(editDate, "MMM dd, yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={editDate}
              onSelect={setEditDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {editDate && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground h-6 px-2"
            onClick={() => setEditDate(undefined)}
          >
            <X className="size-3 mr-1" />
            Clear date
          </Button>
        )}
      </div>

      {/* Priority */}
      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/40 p-3.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Flag className="size-3.5" />
          Priority
        </label>
        <TaskDropdownMenu
          icon={<Flag className="h-4 w-4" />}
          placeholder="Priority"
          value={editPriority.toString()}
          options={PRIORITIES.map((p) => ({ value: p.value.toString(), label: p.label }))}
          onValueChange={(val) => setEditPriority(parseInt(val) as TaskPriority)}
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/40 p-3.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Tag className="size-3.5" />
          Category
        </label>
        <TaskDropdownMenu
          icon={<Tag className="h-4 w-4" />}
          placeholder="Category"
          value={editCategory}
          options={categoryOptions}
          onValueChange={setEditCategory}
        />
      </div>

      {/* Project */}
      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/40 p-3.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <FolderKanban className="size-3.5" />
          Project
        </label>
        <TaskDropdownMenu
          icon={<FolderKanban className="h-4 w-4" />}
          placeholder="Project"
          value={editProject}
          options={[{ value: "inbox", label: "Inbox" }, ...projectOptions]}
          onValueChange={setEditProject}
        />
      </div>

      {/* Subtasks */}
      <div className="space-y-2 rounded-xl border border-border/60 bg-card/40 p-3.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Subtasks
        </label>
        <TaskSubtasksEditor
          subtasks={editSubtasks}
          onSubtasksChange={setEditSubtasks}
          showToggle
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/40 p-3.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Tag className="size-3.5" />
          Tags
        </label>
        <TaskTagsInput tags={editTags} onTagsChange={setEditTags} hideIcon />
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t bg-background/95 pt-4 backdrop-blur">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!editTitle.trim()}
          onClick={handleSave}
          className="bg-brand hover:bg-brand-hover text-white"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
