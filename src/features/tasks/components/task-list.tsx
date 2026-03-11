import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { TaskItem } from "@/features/tasks/components/task-item";
import type { CalendarTask } from "@/features/tasks/types/task.types";

export interface TaskListProps {
  title?: string;
  tasks: CalendarTask[];
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (task: CalendarTask) => void;
  onDelete?: (taskId: string) => void;
  onTaskClick?: (task: CalendarTask) => void;
  onAddTask?: () => void;
  showProject?: boolean;
  showCategory?: boolean;
  showRestore?: boolean; // For trash view
  emptyState?: React.ReactNode;
  showHeader?: boolean;
  headerActions?: React.ReactNode;
  className?: string;
  loading?: boolean;
  groupBy?: "none" | "priority" | "dueDate" | "project" | "category";
}

const groupTasks = (tasks: CalendarTask[], groupBy: string): [string, CalendarTask[]][] => {
  if (groupBy === "none") {
    return [["All", tasks]];
  }

  const grouped: Record<string, CalendarTask[]> = {};

  tasks.forEach((task) => {
    let key = "Other";

    switch (groupBy) {
      case "priority": {
        const priorityLabels = { 1: "Low", 2: "Medium", 3: "High", 4: "Urgent" };
        key = priorityLabels[task.priority as keyof typeof priorityLabels] || "Other";
        break;
      }
      case "project": {
        key = task.project || "No Project";
        break;
      }
      case "category": {
        key = task.category || "No Category";
        break;
      }
      case "dueDate": {
        if (task.dueDate) {
          const date = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const taskDate = new Date(date);
          taskDate.setHours(0, 0, 0, 0);

          if (taskDate < today) {
            key = "Overdue";
          } else if (taskDate.getTime() === today.getTime()) {
            key = "Today";
          } else if (taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            key = "This Week";
          } else {
            key = "Later";
          }
        } else {
          key = "No Due Date";
        }
        break;
      }
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(task);
  });

  // Sort groups in a logical order
  const order: Record<string, number> = {
    Overdue: 1,
    Today: 2,
    "This Week": 3,
    Later: 4,
    Urgent: 1,
    High: 2,
    Medium: 3,
    Low: 4,
  };

  return Object.entries(grouped).sort(([a], [b]) => {
    const orderA = order[a] || 999;
    const orderB = order[b] || 999;
    return orderA - orderB;
  });
};

export function TaskList({
  title,
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onTaskClick,
  onAddTask,
  showProject = true,
  showCategory = true,
  showRestore = false,
  emptyState,
  showHeader = true,
  headerActions,
  className,
  loading = false,
  groupBy = "none",
}: TaskListProps) {
  const groupedTasks = React.useMemo(() => {
    return groupTasks(tasks, groupBy);
  }, [tasks, groupBy]);

  const isEmpty = tasks.length === 0;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header - only show when we have tasks or when explicitly showing header with actions */}
      {showHeader && !isEmpty && (title || headerActions || onAddTask) && (
        <div className="flex items-center justify-between px-6 py-4 border-b">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          <div className="flex items-center gap-2">
            {headerActions}
            {onAddTask && (
              <Button
                onClick={onAddTask}
                size="sm"
                className="bg-[#e44232] hover:bg-[#c3392b] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add task
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Header for pages that need actions even when empty (like Completed/Trash) */}
      {showHeader && isEmpty && headerActions && (
        <div className="flex items-center justify-between px-6 py-4 border-b">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          <div className="flex items-center gap-2">{headerActions}</div>
        </div>
      )}

      {/* Task List */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-muted animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex items-center justify-center h-full min-h-80">
              {emptyState || (
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">No tasks yet</p>
                  <p className="text-sm">Create your first task to get started</p>
                </div>
              )}
            </div>
          ) : groupBy === "none" && groupedTasks.length === 1 ? (
            <div className="space-y-2">
              {groupedTasks[0][1].map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClick={onTaskClick}
                  showProject={showProject}
                  showCategory={showCategory}
                  showRestore={showRestore}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {groupedTasks.map(([groupName, groupTasks]) => (
                <div key={groupName}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4">
                    {groupName}
                    <span className="ml-2 text-xs font-normal">({groupTasks.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {groupTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onClick={onTaskClick}
                        showProject={showProject}
                        showCategory={showCategory}
                        showRestore={showRestore}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Add Task */}
      {onAddTask && !isEmpty && (
        <div className="px-6 py-3 border-t">
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 text-sm text-[#e44232] hover:text-[#c3392b] font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </div>
      )}
    </div>
  );
}
