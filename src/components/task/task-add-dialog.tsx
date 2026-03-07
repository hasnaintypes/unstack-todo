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
  Clock,
  Palette,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CalendarTask, TaskColor, TaskPriority } from "@/types/task";

export interface EmptyStateTaskInput {
  title: string;
  description?: string;
  subtasks?: string[];
  dueDate?: string;
  priority?: string;
  category?: string;
}

export interface TaskAddDialogProps {
  task?: CalendarTask;
  onSave?: (task: Partial<CalendarTask>) => void;
  onAddTask?: (task: EmptyStateTaskInput) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const COLORS: { value: TaskColor; label: string; class: string }[] = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "gray", label: "Gray", class: "bg-gray-500" },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "Priority 1 - Low" },
  { value: 2, label: "Priority 2 - Medium" },
  { value: 3, label: "Priority 3 - High" },
  { value: 4, label: "Priority 4 - Urgent" },
];

// Generate time options (24-hour format)
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export function TaskAddDialog({
  task,
  onSave,
  onAddTask,
  open,
  onOpenChange,
  trigger,
}: TaskAddDialogProps) {
  const isEditMode = !!task;

  const [title, setTitle] = React.useState(task?.title || "");
  const [description, setDescription] = React.useState(task?.description || "");
  const [date, setDate] = React.useState<Date | undefined>(
    task?.dueDate ? parseISO(task.dueDate) : undefined
  );
  const [startTime, setStartTime] = React.useState(task?.startTime || "");
  const [endTime, setEndTime] = React.useState(task?.endTime || "");
  const [priority, setPriority] = React.useState<TaskPriority>(task?.priority || 2);
  const [color, setColor] = React.useState<TaskColor>(task?.color || "blue");
  const [category, setCategory] = React.useState(task?.category || "");
  const [subtasks, setSubtasks] = React.useState<string[]>(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = React.useState("");
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);

  // Update form when task changes
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDate(task.dueDate ? parseISO(task.dueDate) : undefined);
      setStartTime(task.startTime || "");
      setEndTime(task.endTime || "");
      setPriority(task.priority);
      setColor(task.color);
      setCategory(task.category || "");
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(undefined);
    setStartTime("");
    setEndTime("");
    setPriority(2);
    setColor("blue");
    setCategory("");
    setSubtasks([]);
    setIsAddingSubtask(false);
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
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        priority,
        color,
        category: category.trim() || undefined,
        status: task?.status || "todo",
      };
      onSave(taskData);
    }

    if (!isEditMode) {
      resetForm();
    }
    onOpenChange?.(false);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
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
            placeholder="Task name"
            className="w-full bg-transparent px-0 text-xl font-semibold outline-none placeholder:text-muted-foreground/40"
            autoFocus
          />

          {/* Description */}
          <div className="flex gap-3">
            <AlignLeft className="h-5 w-5 text-muted-foreground/60 shrink-0 mt-2" />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="min-h-25 resize-none border-none bg-transparent p-2 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 leading-relaxed"
            />
          </div>

          {/* Sub-tasks Section */}
          <div className="space-y-2">
            {subtasks.map((task, index) => (
              <div key={index} className="group flex items-center gap-3 pl-8 text-sm">
                <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                <span className="flex-1 text-foreground/80">{task}</span>
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

          {/* Date and Time Row */}
          <div className="space-y-3 border-t pt-4">
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

              {/* Start Time */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 gap-2 px-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                  >
                    <Clock className="h-4 w-4" />
                    {startTime || "Start time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Start Time</p>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger className="w-35">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-75">
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {startTime && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStartTime("")}
                        className="w-full"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* End Time */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 gap-2 px-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                  >
                    <Clock className="h-4 w-4" />
                    {endTime || "End time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">End Time</p>
                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger className="w-35">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-75">
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {endTime && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEndTime("")}
                        className="w-full"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Priority, Color, and Category Row */}
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <Select
              value={priority.toString()}
              onValueChange={(val) => setPriority(parseInt(val) as TaskPriority)}
            >
              <SelectTrigger className="h-9 w-fit gap-2 text-sm font-medium hover:bg-accent">
                <Flag className="h-4 w-4" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent align="start">
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value.toString()}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 gap-2 px-3 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  <Palette className="h-4 w-4" />
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full",
                      COLORS.find((c) => c.value === color)?.class
                    )}
                  />
                  {COLORS.find((c) => c.value === color)?.label}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <div className="space-y-2">
                  <p className="text-sm font-medium mb-2">Select Color</p>
                  <div className="grid grid-cols-4 gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={cn(
                          "group relative h-10 w-10 rounded-lg border-2 transition-all hover:scale-110",
                          color === c.value ? "border-foreground scale-110" : "border-transparent"
                        )}
                      >
                        <div className={cn("absolute inset-1 rounded-md", c.class)} />
                        <span className="sr-only">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-fit gap-2 px-3 text-sm font-medium hover:bg-accent">
                <Tag className="h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
              </SelectContent>
            </Select>
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
