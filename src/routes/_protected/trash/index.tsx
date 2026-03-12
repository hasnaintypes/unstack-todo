import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { TaskList } from "@/features/tasks/components/task-list";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { RotateCcw, Trash2 } from "lucide-react";
import { useTrashTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/shared/hooks/use-tasks";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { projectTaskEmptyState } from "@/assets";

export const Route = createFileRoute("/_protected/trash/")({
  component: TrashPage,
});

function TrashPage() {
  const trashedTasks = useTrashTasks();
  const { restoreFromTrash, permanentlyDelete, emptyTrash, restoreAllFromTrash } = useTasks();

  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isEmptyTrashOpen, setEmptyTrashOpen] = useState(false);
  const [isRestoreAllOpen, setRestoreAllOpen] = useState(false);

  const handleRestoreTask = (task: CalendarTask) => {
    restoreFromTrash(task.id);
  };

  return (
    <>
      <TaskList
        title="Trash"
        tasks={trashedTasks}
        onRestore={handleRestoreTask}
        onDelete={(taskId: string) => setDeleteTaskId(taskId)}
        showProject
        showCategory
        showRestore
        persistKey="trash"
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
                onClick={() => setRestoreAllOpen(true)}
                className="text-green-600 hover:text-green-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore all
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmptyTrashOpen(true)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Empty trash
              </Button>
            </div>
          )
        }
      />

      {/* Permanent Delete Confirmation */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTaskId) permanentlyDelete(deleteTaskId);
                setDeleteTaskId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty Trash Confirmation */}
      <AlertDialog open={isEmptyTrashOpen} onOpenChange={setEmptyTrashOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {trashedTasks.length} item
              {trashedTasks.length !== 1 ? "s" : ""} in trash. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => emptyTrash()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Empty trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore All Confirmation */}
      <AlertDialog open={isRestoreAllOpen} onOpenChange={setRestoreAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore all tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all {trashedTasks.length} item{trashedTasks.length !== 1 ? "s" : ""}{" "}
              from trash back to their original locations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreAllFromTrash()}
              className="bg-brand hover:bg-brand-hover text-white"
            >
              Restore all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
