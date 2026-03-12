import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
  List,
  LayoutGrid,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import type { Project } from "@/features/projects/types/project.types";
import { PROJECT_COLORS, PROJECT_COLOR_MAP } from "@/features/projects/utils/colors";

export type ViewMode = "list" | "kanban";

interface ProjectHeaderProps {
  project: Project;
  onAiGenerate: () => void;
  isAiGenerating?: boolean;
  onAddTask: () => void;
  onDelete: () => void;
  onUpdate: (data: { name?: string; description?: string; color?: string }) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export function ProjectHeader({
  project,
  onAiGenerate,
  isAiGenerating,
  onAddTask,
  onDelete,
  onUpdate,
  viewMode = "list",
  onViewModeChange,
}: ProjectHeaderProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDescription, setEditDescription] = useState(project.description || "");
  const [editColor, setEditColor] = useState(project.color);

  const handleStartEdit = () => {
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditColor(project.color);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editName.trim()) return;
    onUpdate({
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      color: editColor,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 mt-1"
          onClick={() => navigate({ to: "/inbox" })}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0 space-y-3">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Project name"
            className="text-lg font-bold h-10"
            autoFocus
          />
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            className="text-sm h-9"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Color:</span>
            <div className="flex gap-1.5 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setEditColor(c.value)}
                  title={c.label}
                  className={cn(
                    "relative size-6 rounded-full transition-all duration-200 flex items-center justify-center",
                    c.class,
                    editColor === c.value
                      ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                      : "opacity-60 hover:opacity-100 hover:scale-105"
                  )}
                >
                  {editColor === c.value && <Check className="size-3 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1.5">
            <X className="size-3.5" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!editName.trim()}
            className="bg-brand hover:bg-brand-hover text-white gap-1.5"
          >
            <Check className="size-3.5" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 mt-1"
        onClick={() => navigate({ to: "/inbox" })}
      >
        <ArrowLeft className="size-4" />
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <div
            className={cn(
              "size-3.5 rounded-full shrink-0",
              PROJECT_COLOR_MAP[project.color] || "bg-blue-500"
            )}
          />
          <h1 className="text-2xl font-bold tracking-tight truncate">{project.name}</h1>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground ml-6.5">{project.description}</p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div className="flex items-center rounded-md border bg-muted/50 p-0.5">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => onViewModeChange("list")}
              title="List view"
            >
              <List className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              onClick={() => onViewModeChange("kanban")}
              title="Board view"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onAiGenerate}
          disabled={isAiGenerating}
          className="gap-1.5"
        >
          {isAiGenerating ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          {isAiGenerating ? "Generating..." : "AI Generate"}
        </Button>
        <Button
          size="sm"
          onClick={onAddTask}
          className="bg-brand hover:bg-brand-hover text-white gap-1.5"
        >
          <Plus className="size-3.5" />
          Add task
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleStartEdit}>
              <Pencil className="size-4 mr-2" />
              Edit Project
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
