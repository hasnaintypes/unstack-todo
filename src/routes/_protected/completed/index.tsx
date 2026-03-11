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
import { ArchiveRestore } from "lucide-react";
import { useCompletedTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/shared/hooks/use-tasks";
import { completedTaskEmptyState } from "@/assets";

export const Route = createFileRoute("/_protected/completed/")({
  component: CompletedPage,
});

function CompletedPage() {
  const completedTasks = useCompletedTasks();
  const { toggleTaskComplete, moveToTrash, clearCompleted, setSelectedTask } = useTasks();
  const [isClearDialogOpen, setClearDialogOpen] = useState(false);

  return (
    <>
      <TaskList
        title="Completed"
        tasks={completedTasks}
        onToggleComplete={toggleTaskComplete}
        onDelete={moveToTrash}
        onTaskClick={setSelectedTask}
        groupBy="project"
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
              className="bg-[#e44232] hover:bg-[#c3392b] text-white"
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
