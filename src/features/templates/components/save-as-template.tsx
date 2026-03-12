import { useState } from "react";
import { BookmarkPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { templateService } from "../services/template.service";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { toast } from "sonner";

interface SaveAsTemplateProps {
  task: CalendarTask;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveAsTemplate({ task, userId, open, onOpenChange }: SaveAsTemplateProps) {
  const [name, setName] = useState(task.title);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await templateService.createTemplate(
        {
          userId,
          name: name.trim(),
          title: task.title,
          description: task.description,
          priority: task.priority,
          subtasks: task.subtasks?.map((s) => ({ ...s, completed: false })),
          category: task.category,
          project: task.project,
        },
        userId
      );
      toast.success("Template saved", {
        description: `"${name.trim()}" can now be used to create new tasks.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="size-4" />
            Save as Template
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">Template name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Weekly Review"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!name.trim() || isSaving}
            onClick={handleSave}
            className="bg-brand hover:bg-brand-hover text-white"
          >
            {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
