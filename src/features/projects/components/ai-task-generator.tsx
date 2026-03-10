import { useState, useCallback } from "react";
import { Sparkles, X, Check, Plus, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import {
  generateTaskSuggestions,
  type TaskSuggestion,
} from "@/shared/services/ai.service";
import type { Project } from "@/features/projects/types/project.types";

interface AiTaskGeneratorProps {
  project: Project;
  onClose: () => void;
  onAddTasks: (suggestions: TaskSuggestion[]) => Promise<void>;
  autoGenerate?: boolean;
}

export function AiTaskGenerator({ project, onClose, onAddTasks, autoGenerate }: AiTaskGeneratorProps) {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const result = await generateTaskSuggestions(project.name, project.description || "");
      setSuggestions(result);
      setSelectedSuggestions(new Set(result.map((_: TaskSuggestion, i: number) => i)));
    } catch (err) {
      console.error("Error generating suggestions:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [project]);

  // Auto-generate on mount if requested
  useState(() => {
    if (autoGenerate && suggestions.length === 0) {
      handleGenerate();
    }
  });

  const toggleSuggestion = (idx: number) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleAddSelected = async () => {
    setIsAdding(true);
    try {
      const selected = [...selectedSuggestions].map((idx) => suggestions[idx]);
      await onAddTasks(selected);
      onClose();
    } catch (err) {
      console.error("Error adding tasks:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[#e44232]" />
          <span className="text-sm font-semibold">AI Task Suggestions</span>
        </div>
        <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
          <X className="size-3.5" />
        </Button>
      </div>
      <div className="p-5">
        {isGenerating ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 className="size-6 animate-spin text-[#e44232]" />
            <p className="text-sm text-muted-foreground">Generating tasks for &quot;{project.name}&quot;...</p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => toggleSuggestion(i)}
                  className={cn(
                    "flex items-start gap-3 w-full text-left p-3 rounded-lg border transition-all",
                    selectedSuggestions.has(i)
                      ? "border-[#e44232]/30 bg-[#e44232]/5"
                      : "border-transparent hover:bg-accent/50"
                  )}
                >
                  <div className={cn(
                    "flex size-5 items-center justify-center rounded border-2 shrink-0 mt-0.5 transition-colors",
                    selectedSuggestions.has(i)
                      ? "bg-[#e44232] border-[#e44232]"
                      : "border-muted-foreground/30"
                  )}>
                    {selectedSuggestions.has(i) && <Check className="size-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0",
                    s.priority === 4 && "bg-red-500/10 text-red-600",
                    s.priority === 3 && "bg-orange-500/10 text-orange-600",
                    s.priority === 2 && "bg-yellow-500/10 text-yellow-600",
                    s.priority === 1 && "bg-blue-500/10 text-blue-600",
                  )}>
                    P{s.priority}
                  </span>
                </button>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {selectedSuggestions.size} of {suggestions.length} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddSelected}
                  disabled={selectedSuggestions.size === 0 || isAdding}
                  className="bg-[#e44232] hover:bg-[#c3392b] text-white gap-1.5"
                >
                  {isAdding ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  Add {selectedSuggestions.size} task{selectedSuggestions.size !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 gap-3">
            <Sparkles className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Click generate to create task suggestions</p>
            <Button size="sm" onClick={handleGenerate} className="bg-[#e44232] hover:bg-[#c3392b] text-white">
              Generate Tasks
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
