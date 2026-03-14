import * as React from "react";
import { Plus, X, CheckCircle2 } from "lucide-react";
import type { Subtask } from "@/features/tasks/types/task.types";
import { cn } from "@/shared/lib/utils";

interface TaskSubtasksEditorProps {
  subtasks: Subtask[];
  onSubtasksChange: (subtasks: Subtask[]) => void;
  /** Show toggle checkboxes for completing subtasks (used in edit mode) */
  showToggle?: boolean;
}

export function TaskSubtasksEditor({
  subtasks,
  onSubtasksChange,
  showToggle = false,
}: TaskSubtasksEditorProps) {
  const [newSubtask, setNewSubtask] = React.useState("");
  const [newSubtaskDesc, setNewSubtaskDesc] = React.useState("");
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onSubtasksChange([
        ...subtasks,
        {
          title: newSubtask.trim(),
          description: newSubtaskDesc.trim() || undefined,
          completed: false,
        },
      ]);
      setNewSubtask("");
      setNewSubtaskDesc("");
    }
  };

  return (
    <div className="space-y-2">
      {subtasks.map((subtask, index) => (
        <div key={`subtask-${index}`} className="group flex items-start gap-3 pl-8 text-sm">
          {showToggle ? (
            <button
              onClick={() =>
                onSubtasksChange(
                  subtasks.map((s, i) =>
                    i === index ? { ...s, completed: !s.completed } : s
                  )
                )
              }
              className={cn(
                "flex items-center justify-center h-4.5 w-4.5 rounded-full border-2 shrink-0 mt-0.5 transition-all",
                subtask.completed
                  ? "bg-brand border-brand"
                  : "border-muted-foreground/30 hover:border-brand"
              )}
            >
              {subtask.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
            </button>
          ) : (
            <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <span
              className={cn(
                "text-foreground/80",
                showToggle && subtask.completed && "line-through text-muted-foreground"
              )}
            >
              {subtask.title}
            </span>
            {subtask.description && (
              <p className="text-xs text-muted-foreground">{subtask.description}</p>
            )}
          </div>
          <button onClick={() => onSubtasksChange(subtasks.filter((_, i) => i !== index))}>
            <X className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      ))}

      {isAddingSubtask ? (
        <div className="pl-8 space-y-1">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "shrink-0 rounded-full border",
                showToggle
                  ? "h-4.5 w-4.5 border-2 border-muted-foreground/30"
                  : "h-4 w-4 border-muted-foreground/30"
              )}
            />
            <input
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none"
              placeholder="Subtask title"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSubtask();
                } else if (e.key === "Escape") {
                  setIsAddingSubtask(false);
                  setNewSubtask("");
                  setNewSubtaskDesc("");
                }
              }}
            />
          </div>
          <input
            className="flex-1 bg-transparent text-xs text-muted-foreground outline-none pl-7 w-full"
            placeholder="Description (optional)"
            value={newSubtaskDesc}
            onChange={(e) => setNewSubtaskDesc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubtask();
              else if (e.key === "Escape") {
                setIsAddingSubtask(false);
                setNewSubtask("");
                setNewSubtaskDesc("");
              }
            }}
            onBlur={() => {
              if (newSubtask.trim()) handleAddSubtask();
              else {
                setIsAddingSubtask(false);
                setNewSubtaskDesc("");
              }
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAddingSubtask(true)}
          className={cn(
            "flex items-center gap-2 text-xs font-medium text-muted-foreground/60 hover:text-brand transition-colors",
            !showToggle && "pl-8"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          Add sub-task
        </button>
      )}
    </div>
  );
}
