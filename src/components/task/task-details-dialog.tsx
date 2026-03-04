import { format, parseISO } from "date-fns";
import {
  Calendar,
  Flag,
  Tag,
  CheckCircle2,
  Circle,
  Clock,
  AlignLeft,
  ListTodo,
  Palette,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CalendarTask, TaskColor } from "@/types/calendar";
import { getPriorityLabel } from "@/lib/calendar-helpers";

interface TaskDetailsDialogProps {
  task: CalendarTask;
  children: React.ReactNode;
}

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
};

const COLOR_DISPLAY: Record<TaskColor, { name: string; class: string }> = {
  blue: { name: "Blue", class: "border-blue-500 text-blue-700 dark:text-blue-300" },
  green: { name: "Green", class: "border-green-500 text-green-700 dark:text-green-300" },
  red: { name: "Red", class: "border-red-500 text-red-700 dark:text-red-300" },
  yellow: { name: "Yellow", class: "border-yellow-500 text-yellow-700 dark:text-yellow-300" },
  purple: { name: "Purple", class: "border-purple-500 text-purple-700 dark:text-purple-300" },
  orange: { name: "Orange", class: "border-orange-500 text-orange-700 dark:text-orange-300" },
  gray: { name: "Gray", class: "border-gray-500 text-gray-700 dark:text-gray-300" },
};

const PRIORITY_CLASSES = {
  1: "border-blue-500 text-blue-700 dark:text-blue-300",
  2: "border-yellow-500 text-yellow-700 dark:text-yellow-300",
  3: "border-orange-500 text-orange-700 dark:text-orange-300",
  4: "border-red-500 text-red-700 dark:text-red-300",
};

export function TaskDetailsDialog({ task, children }: TaskDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status */}
          <div className="flex items-start gap-3">
            {task.status === "completed" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">Status</p>
              <Badge
                variant="outline"
                className={cn(
                  "mt-1",
                  task.status === "completed" && "border-green-600 text-green-600",
                  task.status === "in-progress" && "border-blue-600 text-blue-600"
                )}
              >
                {statusLabels[task.status]}
              </Badge>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Due Date</p>
              <p className="text-sm text-muted-foreground mt-1">
                {format(parseISO(task.dueDate), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Time */}
          {(task.startTime || task.endTime) && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {task.startTime && task.endTime
                    ? `${task.startTime} - ${task.endTime}`
                    : task.startTime || task.endTime}
                </p>
              </div>
            </div>
          )}

          {/* Priority */}
          <div className="flex items-start gap-3">
            <Flag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Priority</p>
              <Badge variant="outline" className={cn("mt-1", PRIORITY_CLASSES[task.priority])}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
          </div>

          {/* Color */}
          <div className="flex items-start gap-3">
            <Palette className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Color</p>
              <Badge variant="outline" className={cn("mt-1", COLOR_DISPLAY[task.color].class)}>
                {COLOR_DISPLAY[task.color].name}
              </Badge>
            </div>
          </div>

          {/* Category */}
          {task.category && (
            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm text-muted-foreground mt-1">{task.category}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="flex items-start gap-3">
              <AlignLeft className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex items-start gap-3">
              <ListTodo className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Subtasks</p>
                <ul className="space-y-1">
                  {task.subtasks.map((subtask, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <Circle className="h-3 w-3" />
                      {subtask}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
