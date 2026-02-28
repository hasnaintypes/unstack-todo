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

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface EmptyStateTaskInput {
  title: string;
  description?: string;
  subtasks?: string[];
  dueDate?: string;
  priority?: string;
  category?: string;
}

interface TaskAddCardProps {
  onAddTask?: (task: EmptyStateTaskInput) => void;
  onCancel?: () => void;
  initialDate?: Date;
}

export function TaskAddCard({ onAddTask, onCancel, initialDate }: TaskAddCardProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(initialDate);
  const [priority, setPriority] = React.useState<string | undefined>(undefined);
  const [category, setCategory] = React.useState<string | undefined>(undefined);
  const [subtasks, setSubtasks] = React.useState<string[]>([]);
  const [newSubtask, setNewSubtask] = React.useState("");
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleAddTask = () => {
    if (!title.trim()) return;

    const taskData: EmptyStateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      dueDate: date ? format(date, "PPP") : undefined,
      priority: priority || undefined,
      category: category || undefined,
    };

    onAddTask?.(taskData);
  };

  return (
    <div className="w-full max-w-3xl rounded-lg border border-border bg-card shadow-sm transition-all focus-within:shadow-md">
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
          <AlignLeft className="h-5 w-5 text-muted-foreground/60 flex-shrink-0 mt-2.5" />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="min-h-[80px] resize-none border-none bg-transparent p-2 pl-2 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 leading-relaxed"
          />
        </div>

        {/* Sub-tasks Section */}
        {(subtasks.length > 0 || isAddingSubtask) && (
          <div className="space-y-2 pt-2">
            {subtasks.map((task, index) => (
              <div
                key={index}
                className="group flex items-start gap-3 p-2.5 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                <div className="h-5 w-5 rounded border border-muted-foreground/30 bg-background mt-0.5 flex items-center justify-center flex-shrink-0" />
                <span className="flex-1 text-sm text-foreground/80 pt-0.5">{task}</span>
                <button
                  onClick={() => removeSubtask(index)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded transition-opacity"
                >
                  <X className="h-4 w-4 text-muted-foreground/60" />
                </button>
              </div>
            ))}

            {isAddingSubtask && (
              <div className="flex items-center gap-3 p-2.5 rounded-md bg-muted/40">
                <div className="h-5 w-5 rounded border border-muted-foreground/30 bg-background flex-shrink-0" />
                <input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addSubtask();
                    } else if (e.key === "Escape") {
                      setIsAddingSubtask(false);
                    }
                  }}
                  placeholder="What is the sub-task?"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {!isAddingSubtask && (
          <button
            onClick={() => setIsAddingSubtask(true)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground/70 hover:text-foreground/80 transition-colors pt-1"
          >
            <Plus className="h-4 w-4" />
            Add sub-task
          </button>
        )}

        {/* Metadata Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 gap-2 px-3 text-sm font-medium text-muted-foreground/80 hover:bg-accent",
                  !date && "text-muted-foreground/60",
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {date ? format(date, "MMM dd") : "Due date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-9 w-fit gap-2 px-3 text-sm font-medium border shadow-none hover:bg-accent text-muted-foreground/80">
              <Flag className="h-4 w-4" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p1">Priority 1</SelectItem>
              <SelectItem value="p2">Priority 2</SelectItem>
              <SelectItem value="p3">Priority 3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-fit gap-2 px-3 text-sm font-medium border shadow-none hover:bg-accent text-muted-foreground/80">
              <Tag className="h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="work">Work</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Footer bar */}
      <div className="border-t border-border/40 px-5 py-3 flex items-center justify-between bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 px-3 text-sm font-medium hover:bg-accent"
        >
          <Inbox className="h-4 w-4 text-blue-500" />
          Inbox
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 text-sm font-semibold"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-9 px-4 text-sm font-semibold bg-[#e44232] hover:bg-[#c3392b] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddTask}
            disabled={!title.trim()}
          >
            Add task
          </Button>
        </div>
      </div>
    </div>
  );
}
