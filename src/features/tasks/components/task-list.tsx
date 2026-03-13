import * as React from "react";
import { Plus, ArrowUpDown, Check, Trash2, X, CheckSquare, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { TaskItem } from "@/features/tasks/components/task-item";
import { VirtualizedTaskList } from "@/features/tasks/components/virtualized-task-list";
import type { CalendarTask } from "@/features/tasks/types/task.types";

export type SortBy = "default" | "dueDate" | "priority" | "alphabetical";

export interface TaskListProps {
  title?: string;
  tasks: CalendarTask[];
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (taskId: string, updates: Partial<CalendarTask>) => void;
  onRestore?: (task: CalendarTask) => void;
  onDelete?: (taskId: string) => void;
  onTaskClick?: (task: CalendarTask) => void;
  onAddTask?: () => void;
  showProject?: boolean;
  showCategory?: boolean;
  showRestore?: boolean; // For trash view
  selectable?: boolean;
  onBatchDelete?: (taskIds: string[]) => void;
  persistKey?: string;
  emptyState?: React.ReactNode;
  showHeader?: boolean;
  headerActions?: React.ReactNode;
  className?: string;
  loading?: boolean;
  groupBy?: "none" | "priority" | "dueDate" | "project" | "category";
  defaultSortBy?: SortBy;
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

const sortTasks = (tasks: CalendarTask[], sortBy: SortBy): CalendarTask[] => {
  if (sortBy === "default") return tasks;
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate": {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      case "priority":
        return b.priority - a.priority;
      case "alphabetical":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
};

const sortLabels: Record<SortBy, string> = {
  default: "Default",
  dueDate: "Due Date",
  priority: "Priority",
  alphabetical: "A-Z",
};

export function TaskList({
  title,
  tasks,
  onToggleComplete,
  onEdit,
  onRestore,
  onDelete,
  onTaskClick,
  onAddTask,
  showProject = true,
  showCategory = true,
  showRestore = false,
  selectable = false,
  onBatchDelete,
  persistKey,
  emptyState,
  showHeader = true,
  headerActions,
  className,
  loading = false,
  groupBy = "none",
  defaultSortBy = "default",
}: TaskListProps) {
  const [sortBy, setSortBy] = React.useState<SortBy>(() => {
    if (persistKey) {
      const saved = localStorage.getItem(`unstack-sort-${persistKey}`);
      if (saved && saved in sortLabels) return saved as SortBy;
    }
    return defaultSortBy;
  });
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = React.useState(false);

  React.useEffect(() => {
    if (persistKey) {
      localStorage.setItem(`unstack-sort-${persistKey}`, sortBy);
    }
  }, [sortBy, persistKey]);

  // Clear selection when tasks change
  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [tasks.length]);

  const toggleSelect = React.useCallback((taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
    setSelectMode(false);
  }, []);

  const handleBatchDelete = React.useCallback(() => {
    if (onBatchDelete && selectedIds.size > 0) {
      onBatchDelete([...selectedIds]);
    }
  }, [onBatchDelete, selectedIds]);

  const groupedTasks = React.useMemo(() => {
    const groups = groupTasks(tasks, groupBy);
    return groups.map(([name, groupItems]) => [name, sortTasks(groupItems, sortBy)] as [string, CalendarTask[]]);
  }, [tasks, groupBy, sortBy]);

  const isEmpty = tasks.length === 0;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40",
        className
      )}
    >
      {/* Selection Bar */}
      {selectMode && (
        <div className="flex items-center justify-between border-b border-brand/15 bg-linear-to-r from-brand/10 via-brand/5 to-transparent px-6 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (selectedIds.size === tasks.length) setSelectedIds(new Set());
                else setSelectedIds(new Set(tasks.map((t) => t.id)));
              }}
              className={cn(
                "flex items-center justify-center h-5 w-5 rounded border-2 transition-all",
                selectedIds.size === tasks.length && tasks.length > 0
                  ? "bg-brand border-brand"
                  : "border-muted-foreground/30 hover:border-brand"
              )}
              aria-label="Select all"
            >
              {selectedIds.size === tasks.length && tasks.length > 0 && (
                <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <span className="text-sm font-medium tracking-tight">
              {selectedIds.size} of {tasks.length} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onBatchDelete && selectedIds.size > 0 && (
              <Button variant="outline" size="sm" onClick={handleBatchDelete} className="gap-1.5 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:hover:bg-red-900/20">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearSelection} className="gap-1.5">
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Header - only show when we have tasks or when explicitly showing header with actions */}
      {showHeader && !isEmpty && (title || headerActions || onAddTask) && (
        <div className="flex items-center justify-between border-b bg-background/60 px-6 py-4 backdrop-blur">
          {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
          <div className="flex items-center gap-2">
            {headerActions}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 shadow-sm">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(sortLabels) as SortBy[]).map((key) => (
                  <DropdownMenuItem key={key} onClick={() => setSortBy(key)}>
                    <Check className={cn("h-3.5 w-3.5 mr-2", sortBy === key ? "opacity-100" : "opacity-0")} />
                    {sortLabels[key]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {selectable && !selectMode && (
              <Button variant="outline" size="sm" onClick={() => setSelectMode(true)} className="gap-1.5 shadow-sm">
                <CheckSquare className="h-3.5 w-3.5" />
                Select
              </Button>
            )}
            {onAddTask && (
              <Button
                onClick={onAddTask}
                size="sm"
                className="bg-brand text-white shadow-sm hover:bg-brand-hover"
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
        <div className="flex items-center justify-between border-b bg-background/60 px-6 py-4 backdrop-blur">
          {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
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
                  key={`skeleton-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 px-4 py-3"
                  style={{ opacity: 1 - i * 0.15 }}
                >
                  {/* Checkbox circle */}
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    {/* Title */}
                    <Skeleton className="h-4 rounded" style={{ width: `${65 - i * 8}%` }} />
                    {/* Metadata row */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex items-center justify-center h-full min-h-80">
              {emptyState || (
                <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-border/70 bg-background/70 px-8 py-10 text-center text-muted-foreground shadow-sm">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <p className="mb-1 text-lg font-semibold text-foreground">No tasks yet</p>
                  <p className="text-sm">Create your first task to get started</p>
                </div>
              )}
            </div>
          ) : groupBy === "none" && groupedTasks.length === 1 ? (
            tasks.length > 50 ? (
              <VirtualizedTaskList
                tasks={groupedTasks[0][1]}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onRestore={onRestore}
                onDelete={onDelete}
                onTaskClick={onTaskClick}
                showProject={showProject}
                showCategory={showCategory}
                showRestore={showRestore}
                selectMode={selectMode}
                selectedIds={selectedIds}
                onSelect={toggleSelect}
              />
            ) : (
              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.04 } },
                }}
              >
                {groupedTasks[0][1].map((task) => (
                  <motion.div
                    key={task.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <TaskItem
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onEdit={onEdit}
                      onRestore={onRestore}
                      onDelete={onDelete}
                      onClick={onTaskClick}
                      showProject={showProject}
                      showCategory={showCategory}
                      showRestore={showRestore}
                      selectMode={selectMode}
                      selected={selectedIds.has(task.id)}
                      onSelect={toggleSelect}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )
          ) : (
            <motion.div
              className="space-y-7"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {groupedTasks.map(([groupName, groupTasks]) => (
                <motion.div
                  key={groupName}
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1 },
                  }}
                >
                  <h3 className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <span>{groupName}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tracking-normal text-muted-foreground">
                      {groupTasks.length}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {groupTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          show: { opacity: 1, y: 0 },
                        }}
                      >
                        <TaskItem
                          task={task}
                          onToggleComplete={onToggleComplete}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onClick={onTaskClick}
                          showProject={showProject}
                          showCategory={showCategory}
                          showRestore={showRestore}
                          selectMode={selectMode}
                          selected={selectedIds.has(task.id)}
                          onSelect={toggleSelect}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Add Task */}
      {onAddTask && !isEmpty && (
        <div className="border-t bg-background/40 px-6 py-3 backdrop-blur">
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </div>
      )}
    </div>
  );
}
