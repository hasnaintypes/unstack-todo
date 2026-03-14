import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Pencil,
  MoreVertical,
  Trash2,
  BookmarkPlus,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { TaskDetailContent } from "./task-detail-content";
import { TaskDetailEditForm } from "./task-detail-edit-form";
import { useProjects } from "@/shared/hooks/use-projects";
import { useCategories } from "@/shared/hooks/use-categories";
import { cn } from "@/shared/lib/utils";
import { SaveAsTemplate } from "@/features/templates";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { CalendarTask } from "@/features/tasks/types/task.types";

interface TaskDetailSheetProps {
  task: CalendarTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (taskId: string, data: Partial<CalendarTask>) => void;
  onDelete?: (taskId: string) => void;
}

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

  const isCompleted = task?.status === "completed";

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setIsEditing(false);
    onOpenChange(newOpen);
  };

  const projectOptions = appProjects.map((p) => ({ value: p.name, label: p.name }));
  const categoryOptions = appCategories.map((c) => ({ value: c.name, label: c.name }));

  const handleSave = (taskId: string, data: Partial<CalendarTask>) => {
    onEdit?.(taskId, data);
    setIsEditing(false);
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
                      onClick={() => setIsEditing(true)}
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
              <TaskDetailEditForm
                task={task}
                projectOptions={projectOptions}
                categoryOptions={categoryOptions}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
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
