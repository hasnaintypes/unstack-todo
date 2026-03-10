import { ArrowLeft, Plus, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Project } from "@/features/projects/types/project.types";
import { PROJECT_COLOR_MAP } from "@/features/projects/utils/colors";

interface ProjectHeaderProps {
  project: Project;
  onAiGenerate: () => void;
  isAiGenerating?: boolean;
  onAddTask: () => void;
}

export function ProjectHeader({ project, onAiGenerate, isAiGenerating, onAddTask }: ProjectHeaderProps) {
  const navigate = useNavigate();

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
          <div className={cn("size-3.5 rounded-full shrink-0", PROJECT_COLOR_MAP[project.color] || "bg-blue-500")} />
          <h1 className="text-2xl font-bold tracking-tight truncate">{project.name}</h1>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground ml-6.5">{project.description}</p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={onAiGenerate} disabled={isAiGenerating} className="gap-1.5">
          {isAiGenerating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          {isAiGenerating ? "Generating..." : "AI Generate"}
        </Button>
        <Button
          size="sm"
          onClick={onAddTask}
          className="bg-[#e44232] hover:bg-[#c3392b] text-white gap-1.5"
        >
          <Plus className="size-3.5" />
          Add task
        </Button>
      </div>
    </div>
  );
}
