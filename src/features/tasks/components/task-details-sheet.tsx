import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  Circle,
  Pencil,
  MoreVertical,
  Trash2,
  BookmarkPlus,
  Calendar as CalendarIcon,
  CircleDot,
  Flag,
  Tag,
  FolderKanban,
  AlignLeft,
  Plus,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
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
import { useProjects } from "@/shared/hooks/use-projects";
import { useCategories } from "@/shared/hooks/use-categories";
import { cn } from "@/shared/lib/utils";
import { SaveAsTemplate } from "@/features/templates";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { CalendarTask, Subtask, TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";

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
  const [isSaveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const { user } = useAuth();
  const { projects: appProjects } = useProjects();
  const { categories: appCategories } = useCategories();

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editPriority, setEditPriority] = useState<TaskPriority>(2);
  const [editCategory, setEditCategory] = useState("");
  const [editProject, setEditProject] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [editSubtasks, setEditSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [newSubtaskDescription, setNewSubtaskDescription] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const isCompleted = task?.status === "completed";

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setIsEditing(false);
    onOpenChange(newOpen);
  };

  const projectOptions = appProjects.map((p) => ({ value: p.name, label: p.name }));
  const categoryOptions = appCategories.map((c) => ({ value: c.name, label: c.name }));

  const handleStartEdit = () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditStatus(task.status);
    setEditDescription(task.description || "");
    setEditDate(task.dueDate ? parseISO(task.dueDate) : undefined);
    setEditPriority(task.priority);
    setEditCategory(task.category || "");
    setEditProject(task.project || "");
    setEditTags(task.tags ? [...task.tags] : []);
    setTagInput("");
    setEditSubtasks(task.subtasks ? [...task.subtasks] : []);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!task || !onEdit || !editTitle.trim()) return;
    onEdit(task.id, {
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
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const [editingSubtaskIdx, setEditingSubtaskIdx] = useState<number | null>(null);
  const [subtaskDescription, setSubtaskDescription] = useState("");

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setEditSubtasks([
        ...editSubtasks,
        {
          title: newSubtask.trim(),
          description: newSubtaskDescription.trim() || undefined,
          completed: false,
        },
      ]);
      setNewSubtask("");
      setNewSubtaskDescription("");
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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-border/70 bg-linear-to-b from-background via-background to-muted/20 p-0 sm:max-w-md"
      >
        {task && (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-background/95 px-5 pb-4 pt-5 backdrop-blur">
              {/* Toolbar */}
              <div className="mb-3 flex items-center justify-between gap-2 pr-6">
                <div className="flex items-center gap-2">
                  {onToggleComplete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleComplete(task.id)}
                      className="h-7 gap-1.5 rounded-full border-border/70 bg-card text-xs shadow-sm"
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-full hover:bg-muted"
                      onClick={handleStartEdit}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                  {onDelete && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7 rounded-full hover:bg-muted">
                          <MoreVertical className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user?.$id && (
                          <DropdownMenuItem onClick={() => setSaveTemplateOpen(true)}>
                            <BookmarkPlus className="size-4 mr-2" />
                            Save as Template
                          </DropdownMenuItem>
                        )}
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
                    "text-left text-lg font-semibold leading-snug tracking-tight",
                    isCompleted && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </SheetTitle>
              </SheetHeader>
            </div>

            {isEditing ? (
              /* ========== EDIT MODE ========== */
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
                    icon={<CircleDot className={cn("h-4 w-4", editStatus === "completed" ? "text-green-500" : editStatus === "in-progress" ? "text-blue-500" : "text-muted-foreground")} />}
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
                  {editSubtasks.map((subtask, index) => (
                    <div key={index} className="group">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleToggleEditSubtask(index)}
                          className={cn(
                            "flex items-center justify-center h-4.5 w-4.5 rounded-full border-2 shrink-0 transition-all",
                            subtask.completed
                              ? "bg-brand border-brand"
                              : "border-muted-foreground/30 hover:border-brand"
                          )}
                        >
                          {subtask.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </button>
                        <span
                          className={cn(
                            "text-sm flex-1 cursor-pointer",
                            subtask.completed && "line-through text-muted-foreground"
                          )}
                          onClick={() => {
                            setEditingSubtaskIdx(editingSubtaskIdx === index ? null : index);
                            setSubtaskDescription(subtask.description || "");
                          }}
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
                      {subtask.description && editingSubtaskIdx !== index && (
                        <p className="text-xs text-muted-foreground ml-7 mt-0.5">{subtask.description}</p>
                      )}
                      {editingSubtaskIdx === index && (
                        <div className="ml-7 mt-1">
                          <input
                            autoFocus
                            className="w-full bg-transparent text-xs text-muted-foreground outline-none border-b border-muted-foreground/20 pb-1"
                            value={subtaskDescription}
                            onChange={(e) => setSubtaskDescription(e.target.value)}
                            placeholder="Add a description..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === "Escape") {
                                setEditSubtasks(editSubtasks.map((s, i) =>
                                  i === index ? { ...s, description: subtaskDescription.trim() || undefined } : s
                                ));
                                setEditingSubtaskIdx(null);
                              }
                            }}
                            onBlur={() => {
                              setEditSubtasks(editSubtasks.map((s, i) =>
                                i === index ? { ...s, description: subtaskDescription.trim() || undefined } : s
                              ));
                              setEditingSubtaskIdx(null);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {isAddingSubtask ? (
                    <div className="ml-0 space-y-1">
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
                              setNewSubtaskDescription("");
                            }
                          }}
                        />
                      </div>
                      <input
                        className="w-full bg-transparent text-xs text-muted-foreground outline-none pl-7"
                        value={newSubtaskDescription}
                        onChange={(e) => setNewSubtaskDescription(e.target.value)}
                        placeholder="Description (optional)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddSubtask();
                          else if (e.key === "Escape") {
                            setIsAddingSubtask(false);
                            setNewSubtask("");
                            setNewSubtaskDescription("");
                          }
                        }}
                        onBlur={() => {
                          if (newSubtask.trim()) handleAddSubtask();
                          else {
                            setIsAddingSubtask(false);
                            setNewSubtaskDescription("");
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingSubtask(true)}
                      className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70 transition-colors hover:text-brand"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add sub-task
                    </button>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/40 p-3.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Tag className="size-3.5" />
                    Tags
                  </label>
                  {editTags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {editTags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-xs font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => setEditTags(editTags.filter((_, idx) => idx !== i))}
                            className="hover:text-indigo-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                        e.preventDefault();
                        const newTag = tagInput.trim().replace(/,$/, "");
                        if (newTag && !editTags.includes(newTag)) {
                          setEditTags([...editTags, newTag]);
                        }
                        setTagInput("");
                      }
                    }}
                    onBlur={() => {
                      const newTag = tagInput.trim().replace(/,$/, "");
                      if (newTag && !editTags.includes(newTag)) {
                        setEditTags([...editTags, newTag]);
                      }
                      setTagInput("");
                    }}
                    placeholder="Add tags (press Enter or comma)"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
                  />
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t bg-background/95 pt-4 backdrop-blur">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
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
            ) : (
              /* ========== READ MODE ========== */
              <div className="px-5 pb-5">
                <TaskDetailContent
                  task={task}
                  onUpdateSubtasks={(subtasks) => {
                    if (onEdit) onEdit(task.id, { subtasks });
                  }}
                  onUpdateAttachments={(attachments) => {
                    if (onEdit) onEdit(task.id, { attachments });
                  }}
                  onUpdateStatus={(status) => {
                    if (onEdit) onEdit(task.id, { status: status as CalendarTask["status"] });
                  }}
                />
              </div>
            )}
          </>
        )}
      </SheetContent>

      {task && user?.$id && (
        <SaveAsTemplate
          task={task}
          userId={user.$id}
          open={isSaveTemplateOpen}
          onOpenChange={setSaveTemplateOpen}
        />
      )}
    </Sheet>
  );
}
