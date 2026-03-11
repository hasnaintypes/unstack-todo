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
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  todo: { label: "To Do", color: "text-muted-foreground", icon: "bg-muted" },
  "in-progress": { label: "In Progress", color: "text-blue-500", icon: "bg-blue-500/10" },
  completed: { label: "Completed", color: "text-green-500", icon: "bg-green-500/10" },
};

export function TaskDetailContent({
  task,
  onUpdateSubtasks,
  onUpdateAttachments,
}: TaskDetailContentProps) {
  const { user } = useAuth();
  const priorityConfig = getPriorityConfig(task.priority);
  const status = statusConfig[task.status] || statusConfig.todo;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;

  return (
    <div className="space-y-1 pt-2">
      {/* Properties grid */}
      <div className="grid gap-0">
        {/* Status */}
        <PropertyRow icon={<CircleDot className={cn("size-4", status.color)} />} label="Status">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              task.status === "completed" &&
                "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
              task.status === "in-progress" &&
                "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
              task.status === "todo" && "bg-muted"
            )}
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

        {/* Recurrence */}
        {task.recurrence && (
          <PropertyRow icon={<Repeat className="size-4 text-[#e44232]" />} label="Repeats">
            <Badge
              variant="outline"
              className="text-xs font-medium bg-[#e44232]/10 border-[#e44232]/20 text-[#e44232] capitalize"
            >
              {task.recurrence}
            </Badge>
          </PropertyRow>
        )}

        {/* Reminder */}
        {task.reminderEnabled && (
          <PropertyRow icon={<Bell className="size-4 text-[#e44232]" />} label="Reminder">
            <Badge
              variant="outline"
              className="text-xs font-medium bg-[#e44232]/10 border-[#e44232]/20 text-[#e44232]"
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
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <AlignLeft className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pl-6 text-foreground/80">
            {task.description}
          </p>
        </div>
      )}

      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-3">
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
          <div className="h-1.5 w-full rounded-full bg-muted mb-3 ml-6 max-w-[calc(100%-1.5rem)]">
            <div
              className="h-full rounded-full bg-[#e44232] transition-all duration-300"
              style={{
                width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
              }}
            />
          </div>

          <ul className="space-y-1 pl-6">
            {task.subtasks.map((subtask, index) => (
              <li key={index} className="flex items-center gap-2.5 group py-1">
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
                      ? "bg-[#e44232] border-[#e44232]"
                      : "border-muted-foreground/30 hover:border-[#e44232]"
                  )}
                >
                  {subtask.completed && <CheckCircle2 className="size-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm leading-relaxed break-words",
                      subtask.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {subtask.title}
                  </span>
                  {subtask.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 break-words">
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
    <div className="pt-3 border-t">
      <div className="flex items-center justify-between mb-3">
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
              className="group flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
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
    <div className="flex items-center gap-3 py-2.5 px-1">
      <div className="flex items-center gap-2 w-28 shrink-0">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
