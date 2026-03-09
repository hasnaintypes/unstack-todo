import { createFileRoute } from "@tanstack/react-router";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { TaskList } from "@/features/tasks/components/task-list";
import { Button } from "@/shared/components/ui/button";
import { RotateCcw, Trash2 } from "lucide-react";
import { useTrashTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/app/providers/task-provider";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { projectTaskEmptyState } from "@/assets";

export const Route = createFileRoute("/_protected/trash/")({
  component: TrashPage,
});

function TrashPage() {
  const trashedTasks = useTrashTasks();
  const { restoreFromTrash, permanentlyDelete, emptyTrash, restoreAllFromTrash } = useTasks();

  const handleRestoreTask = (task: CalendarTask) => {
    restoreFromTrash(task.id);
  };

  const handlePermanentDelete = (taskId: string) => {
    if (confirm("Are you sure? This action cannot be undone.")) {
      permanentlyDelete(taskId);
    }
  };

  const handleEmptyTrash = () => {
    if (confirm("Are you sure you want to permanently delete all items in trash? This action cannot be undone.")) {
      emptyTrash();
    }
  };

  const handleRestoreAll = () => {
    if (confirm("Restore all items from trash?")) {
      restoreAllFromTrash();
    }
  };

  return (
    <TaskList
      title="Trash"
      tasks={trashedTasks}
      onEdit={handleRestoreTask}
      onDelete={handlePermanentDelete}
      showProject
      showCategory
      showRestore
      emptyState={
        <TaskEmptyState
          image={projectTaskEmptyState}
          imageAlt="Trash is empty"
          title="Trash"
          heading="Trash is empty"
          description="Deleted tasks will appear here for 30 days."
          showAddButton={false}
        />
      }
      headerActions={
        trashedTasks.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestoreAll}
              className="text-green-600 hover:text-green-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore all
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEmptyTrash}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Empty trash
            </Button>
          </div>
        )
      }
    />
  );
}
