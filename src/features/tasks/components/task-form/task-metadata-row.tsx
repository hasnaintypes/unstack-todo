import { Flag, Tag, FolderKanban, Sparkles, Repeat } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";
import { TaskDropdownMenu } from "@/features/tasks/components/task-dropdown-menu";
import type { TaskPriority, Recurrence } from "@/features/tasks/types/task.types";
import { cn } from "@/shared/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
}

interface TaskMetadataRowProps {
  project: string;
  priority: TaskPriority;
  category: string;
  recurrence: Recurrence | "";
  projectOptions: DropdownOption[];
  categoryOptions: DropdownOption[];
  aiPrioritySet: boolean;
  onProjectChange: (value: string) => void;
  onPriorityChange: (value: TaskPriority) => void;
  onCategoryChange: (value: string) => void;
  onRecurrenceChange: (value: Recurrence | "") => void;
  onAiPriorityReset: () => void;
  onAddProject: (label: string) => Promise<void>;
  onAddCategory: (label: string) => Promise<void>;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" },
];

export function TaskMetadataRow({
  project,
  priority,
  category,
  recurrence,
  projectOptions,
  categoryOptions,
  aiPrioritySet,
  onProjectChange,
  onPriorityChange,
  onCategoryChange,
  onRecurrenceChange,
  onAiPriorityReset,
  onAddProject,
  onAddCategory,
}: TaskMetadataRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t pt-4">
      <TaskDropdownMenu
        icon={<FolderKanban className="h-4 w-4" />}
        placeholder="Project"
        value={project}
        options={projectOptions}
        onValueChange={onProjectChange}
        onAddOption={onAddProject}
        showAddOption
        addOptionLabel="Add project"
        addDialogTitle="Create New Project"
        addDialogDescription="Add a new project to organize your tasks."
      />

      <Separator orientation="vertical" className="h-6" />

      <div className="relative">
        <TaskDropdownMenu
          icon={<Flag className={cn("h-4 w-4", aiPrioritySet && "text-brand")} />}
          placeholder="Priority"
          value={priority.toString()}
          options={PRIORITIES.map((p) => ({ value: p.value.toString(), label: p.label }))}
          onValueChange={(val) => {
            onPriorityChange(parseInt(val) as TaskPriority);
            onAiPriorityReset();
          }}
        />
        {aiPrioritySet && (
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-brand" />
        )}
      </div>

      <Separator orientation="vertical" className="h-6" />

      <TaskDropdownMenu
        icon={<Tag className="h-4 w-4" />}
        placeholder="Category"
        value={category}
        options={categoryOptions}
        onValueChange={onCategoryChange}
        onAddOption={onAddCategory}
        showAddOption
        addOptionLabel="Add category"
        addDialogTitle="Create New Category"
        addDialogDescription="Add a new category to group your tasks."
      />

      <Separator orientation="vertical" className="h-6" />

      <TaskDropdownMenu
        icon={<Repeat className={cn("h-4 w-4", recurrence && "text-brand")} />}
        placeholder="Repeat"
        value={recurrence}
        options={[
          { value: "", label: "No repeat" },
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
          { value: "weekdays", label: "Weekdays" },
        ]}
        onValueChange={(val) => onRecurrenceChange(val as Recurrence | "")}
      />
    </div>
  );
}
