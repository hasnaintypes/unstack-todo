"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Flag,
  Tag,
  Inbox,
  AlignLeft,
  ChevronDown,
  Plus,
  X,
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

export interface EmptyStateTaskInput {
  title: string;
  description?: string;
  subtasks?: string[];
  dueDate?: string;
  priority?: string;
  category?: string;
}

interface TaskAddDialogProps {
  onAddTask?: (task: EmptyStateTaskInput) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function TaskAddDialog({ onAddTask, open, onOpenChange, trigger }: TaskAddDialogProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [priority, setPriority] = React.useState<string | undefined>(undefined);
  const [category, setCategory] = React.useState<string | undefined>(undefined);
  const [subtasks, setSubtasks] = React.useState<string[]>([]);
  const [newSubtask, setNewSubtask] = React.useState("");
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(undefined);
    setPriority(undefined);
    setCategory(undefined);
    setSubtasks([]);
    setIsAddingSubtask(false);
  };

  const handleAddTask = () => {
    if (!title.trim()) return;

    onAddTask?.({
      title: title.trim(),
      description: description.trim() || undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      dueDate: date ? format(date, "PPP") : undefined,
      priority,
      category,
    });

    resetForm();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 border-none overflow-hidden bg-card shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Add New Task</DialogTitle>
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
            <AlignLeft className="h-5 w-5 text-muted-foreground/60 flex-shrink-0 mt-2" />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="min-h-[100px] resize-none border-none bg-transparent p-2 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 leading-relaxed"
            />
          </div>

          {/* Sub-tasks Section */}
          <div className="space-y-2">
            {subtasks.map((task, index) => (
              <div key={index} className="group flex items-center gap-3 pl-8 text-sm">
                <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                <span className="flex-1 text-foreground/80">{task}</span>
                <button onClick={() => setSubtasks(subtasks.filter((_, i) => i !== index))}>
                  <X className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            ))}

            {isAddingSubtask ? (
              <div className="flex items-center gap-3 pl-8">
                <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSubtasks([...subtasks, newSubtask]);
                      setNewSubtask("");
                    }
                  }}
                  onBlur={() => setIsAddingSubtask(false)}
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

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 gap-2 px-2 text-xs font-medium text-muted-foreground hover:bg-accent"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {date ? format(date, "MMM dd") : "Due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="h-8 w-fit gap-2 text-xs font-medium hover:bg-accent">
                <Flag className="h-3.5 w-3.5" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="p1">Priority 1</SelectItem>
                <SelectItem value="p2">Priority 2</SelectItem>
                <SelectItem value="p3">Priority 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 w-fit gap-2 px-2 text-xs font-medium hover:bg-accent">
                <Tag className="h-3.5 w-3.5" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="work">Work</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/40 px-5 py-3 flex items-center justify-between bg-muted/20">
          <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-xs font-medium">
            <Inbox className="h-4 w-4 text-blue-500" />
            Inbox
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-4 text-xs font-semibold"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!title.trim()}
              onClick={handleAddTask}
              className="h-8 px-4 text-xs font-semibold bg-[#e44232] hover:bg-[#c3392b] text-white"
            >
              Add task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
