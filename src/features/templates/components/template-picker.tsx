import { useState, useCallback } from "react";
import { FileText, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { templateService } from "../services/template.service";
import type { TaskTemplate } from "../types/template.types";
import { logger } from "@/shared/lib/logger";

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSelect: (template: TaskTemplate) => void;
}

export function TemplatePicker({ open, onOpenChange, userId, onSelect }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<TaskTemplate[] | null>(null);
  const [loadedForOpen, setLoadedForOpen] = useState(false);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen && !loadedForOpen) {
        setLoadedForOpen(true);
        templateService.getTemplates(userId).then(setTemplates);
      }
      if (!newOpen) {
        setLoadedForOpen(false);
        setTemplates(null);
      }
      onOpenChange(newOpen);
    },
    [userId, onOpenChange, loadedForOpen]
  );

  // Trigger load on first open
  if (open && !loadedForOpen) {
    setLoadedForOpen(true);
    templateService.getTemplates(userId).then(setTemplates);
  }

  const handleDelete = async (id: string) => {
    try {
      await templateService.deleteTemplate(id);
      setTemplates((prev) => prev?.filter((t) => t.id !== id) ?? null);
    } catch (error) {
      logger.error("Error deleting template", { error });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Use Template</DialogTitle>
        </DialogHeader>

        {templates === null ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No templates yet</p>
            <p className="text-xs mt-1">Save a task as a template from the task detail view.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => {
                  onSelect(template);
                  onOpenChange(false);
                }}
              >
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{template.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{template.title}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(template.id);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
