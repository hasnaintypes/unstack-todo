import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { TaskList } from "@/features/tasks/components/task-list";
import { BatchDeleteDialog } from "@/features/tasks/components/batch-delete-dialog";
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
import { ArchiveRestore } from "lucide-react";
import { useCompletedTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/shared/hooks/use-tasks";
import { completedTaskEmptyState } from "@/assets";

export const Route = createLazyFileRoute("/_protected/completed/")({
  component: CompletedPage,
});

function CompletedPage() {
  const completedTasks = useCompletedTasks();
  const { toggleTaskComplete, moveToTrash, clearCompleted, setSelectedTask } = useTasks();
  const [isClearDialogOpen, setClearDialogOpen] = useState(false);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  return (
    <>
      <TaskList
        title="Completed"
        tasks={completedTasks}
        onToggleComplete={toggleTaskComplete}
        onDelete={moveToTrash}
        onTaskClick={setSelectedTask}
        groupBy="project"
        selectable
        onBatchDelete={(ids) => { setPendingDeleteIds(ids); setIsBatchDeleteOpen(true); }}
        persistKey="completed"
        emptyState={
          <TaskEmptyState
            image={completedTaskEmptyState}
            imageAlt="No completed tasks"
            title="Completed"
            heading="No completed tasks yet"
            description="Tasks you complete will show here."
            showAddButton={false}
          />
        }
        headerActions={
          completedTasks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearDialogOpen(true)}
              className="text-muted-foreground"
            >
              <ArchiveRestore className="h-4 w-4 mr-2" />
              Clear completed
            </Button>
          )
        }
      />

      <BatchDeleteDialog
        open={isBatchDeleteOpen}
        onOpenChange={setIsBatchDeleteOpen}
        count={pendingDeleteIds.length}
        onConfirm={() => {
          pendingDeleteIds.forEach((id) => moveToTrash(id));
          setPendingDeleteIds([]);
          setIsBatchDeleteOpen(false);
        }}
      />

      <AlertDialog open={isClearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear completed tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move all {completedTasks.length} completed task
              {completedTasks.length !== 1 ? "s" : ""} to trash. You can restore them from trash
              within 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearCompleted()}
              className="bg-brand hover:bg-brand-hover text-white"
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
