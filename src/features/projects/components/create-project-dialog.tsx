import { useState } from "react";
import { Sparkles, Loader2, Check, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useProjects } from "@/shared/hooks/use-projects";
import { PROJECT_COLORS } from "@/features/projects/utils/colors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea"; // Assuming you have this
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (projectId: string, shouldGenerate: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange, onCreated }: CreateProjectDialogProps) {
  const { addProject } = useProjects();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("blue");
  const [generateWithAi, setGenerateWithAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("blue");
    setGenerateWithAi(false);
    setIsSubmitting(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await addProject({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      const shouldGenerate = generateWithAi;
      resetForm();
      onOpenChange(false);
      onCreated?.(created.id, shouldGenerate);
    } catch (err) {
      console.error("Error creating project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) resetForm();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[440px] gap-0 p-0 overflow-hidden outline-none">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">New Project</DialogTitle>
          <DialogDescription>
            Organize your tasks into a dedicated project space.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Website Launch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSubmitting) handleCreate();
              }}
              className="h-10"
              autoFocus
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="project-desc">Description (Optional)</Label>
            <Textarea
              id="project-desc"
              placeholder="What's this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none min-h-[80px]"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <Label>Project Color</Label>
            <div className="flex gap-2.5 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={cn(
                    "relative size-7 rounded-full transition-all duration-200 flex items-center justify-center group",
                    c.class,
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110 shadow-sm"
                      : "opacity-70 hover:opacity-100 hover:scale-105"
                  )}
                >
                  {color === c.value && (
                    <Check className="size-3.5 text-white animate-in zoom-in duration-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* AI Task Generation Toggle */}
          <div className={cn(
            "flex items-center justify-between rounded-xl border p-4 transition-all duration-300",
            generateWithAi 
              ? "bg-primary/5 border-primary/30 ring-1 ring-primary/10 shadow-sm" 
              : "bg-muted/30 border-transparent"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex size-10 items-center justify-center rounded-lg transition-colors",
                generateWithAi ? "bg-[#e44232] text-white shadow-md shadow-primary/20" : "bg-background text-muted-foreground border"
              )}>
                <Sparkles className={cn("size-5", generateWithAi && "animate-pulse")} />
              </div>
              <div className="space-y-0.5">
                <Label className="cursor-pointer text-sm font-semibold" htmlFor="ai-toggle">
                  AI Task Architect
                </Label>
                <p className="text-[12px] text-muted-foreground leading-tight">
                  Automatically draft a task roadmap
                </p>
              </div>
            </div>
            <Switch
              id="ai-toggle"
              checked={generateWithAi}
              onCheckedChange={setGenerateWithAi}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 px-6 bg-muted/30 border-t">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-9 px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isSubmitting}
            className="h-9 px-6 bg-[#e44232] hover:bg-[#c3392b] text-white shadow-sm transition-all active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}