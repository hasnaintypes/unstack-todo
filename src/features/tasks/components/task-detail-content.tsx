import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Flag,
  Tag,
  CheckCircle2,
  Clock,
  AlignLeft,
  ListTodo,
  FolderKanban,
  CircleDot,
  Bell,
  Repeat,
  Paperclip,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { CalendarTask, Subtask, Attachment } from "@/features/tasks/types/task.types";
import { CommentList } from "@/features/comments";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { storageService } from "@/shared/services/storage.service";
import { Button } from "@/shared/components/ui/button";
import { getPriorityConfig } from "@/features/tasks/utils/task-helpers";

interface TaskDetailContentProps {
  task: CalendarTask;
  onUpdateSubtasks?: (subtasks: Subtask[]) => void;
  onUpdateAttachments?: (attachments: Attachment[]) => void;
  onUpdateStatus?: (status: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  todo: { label: "To Do", color: "text-muted-foreground", icon: "bg-muted" },
  "in-progress": { label: "In Progress", color: "text-blue-500", icon: "bg-blue-500/10" },
  completed: { label: "Completed", color: "text-green-500", icon: "bg-green-500/10" },
};

const STATUS_CYCLE: Record<string, string> = {
  todo: "in-progress",
  "in-progress": "completed",
  completed: "todo",
};

export function TaskDetailContent({
  task,
  onUpdateSubtasks,
  onUpdateAttachments,
  onUpdateStatus,
}: TaskDetailContentProps) {
  const { user } = useAuth();
  const priorityConfig = getPriorityConfig(task.priority);
  const status = statusConfig[task.status] || statusConfig.todo;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;

  return (
    <div className="space-y-3 pt-3">
      {/* Properties grid */}
      <div className="grid gap-0 rounded-xl border border-border/60 bg-card/40 p-2">
        {/* Status */}
        <PropertyRow icon={<CircleDot className={cn("size-4", status.color)} />} label="Status">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium cursor-pointer transition-colors hover:ring-1 hover:ring-brand/30",
              task.status === "completed" &&
                "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
              task.status === "in-progress" &&
                "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
              task.status === "todo" && "bg-muted"
            )}
            onClick={() => onUpdateStatus?.(STATUS_CYCLE[task.status] || "todo")}
            title="Click to change status"
          >
            {status.label}
          </Badge>
        </PropertyRow>

        {/* Due Date */}
        {task.dueDate && (
          <PropertyRow
            icon={<Calendar className="size-4 text-muted-foreground" />}
            label="Due date"
          >
            <span className="text-sm">{format(parseISO(task.dueDate), "MMM d, yyyy")}</span>
          </PropertyRow>
        )}

        {/* Time */}
        {(task.startTime || task.endTime) && (
          <PropertyRow icon={<Clock className="size-4 text-muted-foreground" />} label="Time">
            <span className="text-sm">
              {task.startTime && task.endTime
                ? `${task.startTime} – ${task.endTime}`
                : task.startTime || task.endTime}
            </span>
          </PropertyRow>
        )}

        {/* Priority */}
        <PropertyRow
          icon={<Flag className={cn("size-4", priorityConfig.iconClass)} />}
          label="Priority"
        >
          <Badge variant="outline" className={cn("text-xs font-medium", priorityConfig.badgeClass)}>
            {priorityConfig.label}
          </Badge>
        </PropertyRow>

        {/* Category */}
        {task.category && (
          <PropertyRow icon={<Tag className="size-4 text-cyan-500" />} label="Category">
            <span className="text-sm">{task.category}</span>
          </PropertyRow>
        )}

        {/* Project */}
        {task.project && task.project !== "inbox" && (
          <PropertyRow icon={<FolderKanban className="size-4 text-purple-500" />} label="Project">
            <span className="text-sm">{task.project}</span>
          </PropertyRow>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <PropertyRow icon={<Tag className="size-4 text-indigo-500" />} label="Tags">
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs font-medium bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </PropertyRow>
        )}

        {/* Recurrence */}
        {task.recurrence && (
          <PropertyRow icon={<Repeat className="size-4 text-brand" />} label="Repeats">
            <Badge
              variant="outline"
              className="text-xs font-medium bg-brand/10 border-brand/20 text-brand capitalize"
            >
              {task.recurrence}
            </Badge>
          </PropertyRow>
        )}

        {/* Reminder */}
        {task.reminderEnabled && (
          <PropertyRow icon={<Bell className="size-4 text-brand" />} label="Reminder">
            <Badge
              variant="outline"
              className="text-xs font-medium bg-brand/10 border-brand/20 text-brand"
            >
              {task.reminderBefore === "on_due" && "At due time"}
              {task.reminderBefore === "30m" && "30 min before"}
              {task.reminderBefore === "1h" && "1 hour before"}
              {task.reminderBefore === "1d" && "1 day before"}
              {!task.reminderBefore && "Enabled"}
            </Badge>
          </PropertyRow>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <div className="rounded-xl border border-border/60 bg-card/35 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlignLeft className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </span>
          </div>
          <p className="whitespace-pre-wrap wrap-break-word pl-6 text-sm leading-relaxed text-foreground/80">
            {task.description}
          </p>
        </div>
      )}

      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card/35 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Subtasks
              </span>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-3 ml-6 h-1.5 w-full max-w-[calc(100%-1.5rem)] rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand transition-all duration-300"
              style={{
                width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
              }}
            />
          </div>

          <ul className="space-y-1.5 pl-6">
            {task.subtasks.map((subtask, index) => (
              <li key={`subtask-${subtask.title}-${index}`} className="group flex items-center gap-2.5 rounded-lg px-1 py-1">
                <button
                  onClick={() => {
                    if (!onUpdateSubtasks) return;
                    const updated = task.subtasks!.map((s, i) =>
                      i === index ? { ...s, completed: !s.completed } : s
                    );
                    onUpdateSubtasks(updated);
                  }}
                  className={cn(
                    "flex items-center justify-center size-4 rounded-full border-2 shrink-0 transition-all",
                    subtask.completed
                      ? "bg-brand border-brand"
                      : "border-muted-foreground/30 hover:border-brand"
                  )}
                >
                  {subtask.completed && <CheckCircle2 className="size-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm leading-relaxed wrap-break-word",
                      subtask.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {subtask.title}
                  </span>
                  {subtask.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground wrap-break-word">
                      {subtask.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Attachments */}
      <AttachmentSection
        attachments={task.attachments || []}
        onUpdateAttachments={onUpdateAttachments}
      />

      {/* Comments */}
      {user?.$id && <CommentList taskId={task.id} userId={user.$id} />}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentSection({
  attachments,
  onUpdateAttachments,
}: {
  attachments: Attachment[];
  onUpdateAttachments?: (attachments: Attachment[]) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateAttachments) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be under 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const result = await storageService.uploadTaskAttachment(file);
      const newAttachment: Attachment = {
        fileId: result.$id,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };
      onUpdateAttachments([...attachments, newAttachment]);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!onUpdateAttachments) return;
    try {
      await storageService.deleteTaskAttachment(fileId);
      onUpdateAttachments(attachments.filter((a) => a.fileId !== fileId));
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  };

  const handleDownload = (fileId: string) => {
    const url = storageService.getFileDownloadUrl(fileId);
    window.open(url.toString(), "_blank");
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/35 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Attachments
          </span>
          {attachments.length > 0 && (
            <span className="text-xs text-muted-foreground">({attachments.length})</span>
          )}
        </div>
        {onUpdateAttachments && (
          <label>
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
              <span>
                {isUploading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Paperclip className="size-3" />
                )}
                Attach
              </span>
            </Button>
          </label>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="space-y-1.5 pl-6">
          {attachments.map((attachment) => (
            <div
              key={attachment.fileId}
              className="group flex items-center gap-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2"
            >
              <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
              </div>
              <button
                onClick={() => handleDownload(attachment.fileId)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="size-3.5 text-muted-foreground hover:text-foreground" />
              </button>
              {onUpdateAttachments && (
                <button
                  onClick={() => handleDelete(attachment.fileId)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact property row used in the details grid */
function PropertyRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-background/60">
      <div className="flex w-28 shrink-0 items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
