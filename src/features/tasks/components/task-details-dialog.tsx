import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  Circle,
  Pencil,
  MoreVertical,
  Trash2,
  Calendar as CalendarIcon,
  Flag,
  Tag,
  FolderKanban,
  AlignLeft,
  Plus,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { TaskDropdownMenu } from "./task-dropdown-menu";
import { TaskDetailContent } from "./task-detail-content";
import { useProjects } from "@/app/providers/project-provider";
import { useCategories } from "@/app/providers/category-provider";
import { cn } from "@/shared/lib/utils";
import type { CalendarTask, Subtask, TaskPriority } from "@/features/tasks/types/task.types";

interface TaskDetailSheetProps {
  task: CalendarTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (taskId: string, data: Partial<CalendarTask>) => void;
  onDelete?: (taskId: string) => void;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" },
];

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { projects: appProjects } = useProjects();
  const { categories: appCategories } = useCategories();

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editPriority, setEditPriority] = useState<TaskPriority>(2);
  const [editCategory, setEditCategory] = useState("");
  const [editProject, setEditProject] = useState("");
  const [editSubtasks, setEditSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const isCompleted = task?.status === "completed";

  // Reset edit mode when sheet closes or task changes
  useEffect(() => {
    if (!open) setIsEditing(false);
  }, [open]);

  const projectOptions = appProjects.map((p) => ({ value: p.name, label: p.name }));
  const categoryOptions = appCategories.map((c) => ({ value: c.name, label: c.name }));

  const handleStartEdit = () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDate(task.dueDate ? parseISO(task.dueDate) : undefined);
    setEditPriority(task.priority);
    setEditCategory(task.category || "");
    setEditProject(task.project || "");
    setEditSubtasks(task.subtasks ? [...task.subtasks] : []);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!task || !onEdit || !editTitle.trim()) return;
    onEdit(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      dueDate: editDate ? format(editDate, "yyyy-MM-dd") : undefined,
      priority: editPriority,
      category: editCategory.trim() || undefined,
      project: editProject.trim() || undefined,
      subtasks: editSubtasks.length > 0 ? editSubtasks : undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setEditSubtasks([...editSubtasks, { title: newSubtask.trim(), completed: false }]);
      setNewSubtask("");
    }
  };

  const handleToggleEditSubtask = (index: number) => {
    setEditSubtasks(
      editSubtasks.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (index: number) => {
    setEditSubtasks(editSubtasks.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        {task && (
          <>
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2 mb-3 pr-6">
                <div className="flex items-center gap-2">
                  {onToggleComplete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleComplete(task.id)}
                      className="gap-1.5 h-7 text-xs rounded-full"
                    >
                      {isCompleted ? (
                        <>
                          <Circle className="size-3.5" />
                          Reopen
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          Complete
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {onEdit && !isEditing && (
                    <Button variant="ghost" size="icon" className="size-7" onClick={handleStartEdit}>
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                  {onDelete && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreVertical className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            onDelete(task.id);
                            onOpenChange(false);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Title */}
              <SheetHeader className="p-0">
                <SheetTitle
                  className={cn(
                    "text-lg font-semibold leading-snug text-left",
                    isCompleted && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </SheetTitle>
              </SheetHeader>
            </div>

            {isEditing ? (
              /* ========== EDIT MODE ========== */
              <div className="space-y-4 px-5 pt-4 pb-5">
                {/* Title */}
                <div className="space-y-1.5">
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

                {/* Description */}
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <CalendarIcon className="size-3.5" />
                    Due Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editDate ? format(editDate, "MMM dd, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={editDate} onSelect={setEditDate} initialFocus />
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
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
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
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Subtasks
                  </label>
                  {editSubtasks.map((subtask, index) => (
                    <div key={index} className="group flex items-center gap-2.5">
                      <button
                        onClick={() => handleToggleEditSubtask(index)}
                        className={cn(
                          "flex items-center justify-center h-4.5 w-4.5 rounded-full border-2 shrink-0 transition-all",
                          subtask.completed
                            ? "bg-[#e44232] border-[#e44232]"
                            : "border-muted-foreground/30 hover:border-[#e44232]"
                        )}
                      >
                        {subtask.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </button>
                      <span
                        className={cn(
                          "text-sm flex-1",
                          subtask.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => handleRemoveSubtask(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}

                  {isAddingSubtask ? (
                    <div className="flex items-center gap-2.5">
                      <div className="h-4.5 w-4.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      <input
                        autoFocus
                        className="flex-1 bg-transparent text-sm outline-none"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="Subtask title"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddSubtask();
                          else if (e.key === "Escape") {
                            setIsAddingSubtask(false);
                            setNewSubtask("");
                          }
                        }}
                        onBlur={() => {
                          if (newSubtask.trim()) handleAddSubtask();
                          setIsAddingSubtask(false);
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingSubtask(true)}
                      className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60 hover:text-[#e44232] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add sub-task
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!editTitle.trim()}
                    onClick={handleSave}
                    className="bg-[#e44232] hover:bg-[#c3392b] text-white"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              /* ========== READ MODE ========== */
              <div className="px-5 pb-5">
              <TaskDetailContent
                task={task}
                onUpdateSubtasks={(subtasks) => {
                  if (onEdit) onEdit(task.id, { subtasks });
                }}
              />
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
