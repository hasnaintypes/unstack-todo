import { List, Columns3 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export type ViewMode = "list" | "kanban";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-2.5 gap-1.5 text-xs font-medium rounded-md",
          viewMode === "list"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onViewModeChange("list")}
      >
        <List className="size-3.5" />
        List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-2.5 gap-1.5 text-xs font-medium rounded-md",
          viewMode === "kanban"
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onViewModeChange("kanban")}
      >
        <Columns3 className="size-3.5" />
        Board
      </Button>
    </div>
  );
}
