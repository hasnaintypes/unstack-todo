import { createFileRoute } from "@tanstack/react-router";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { TaskList } from "@/features/tasks/components/task-list";
import { Button } from "@/shared/components/ui/button";
import { ArchiveRestore } from "lucide-react";
import { useCompletedTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/app/providers/task-provider";
import { completedTaskEmptyState } from "@/assets";

export const Route = createFileRoute("/_protected/completed/")({
  component: CompletedPage,
});

function CompletedPage() {
  const completedTasks = useCompletedTasks();
  const { toggleTaskComplete, moveToTrash, clearCompleted } = useTasks();

  const handleClearCompleted = () => {
    if (confirm("Are you sure you want to clear all completed tasks?")) {
      clearCompleted();
    }
  };

  return (
    <TaskList
      title="Completed"
      tasks={completedTasks}
      onToggleComplete={toggleTaskComplete}
      onDelete={moveToTrash}
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
            onClick={handleClearCompleted}
            className="text-muted-foreground"
          >
            <ArchiveRestore className="h-4 w-4 mr-2" />
            Clear completed
          </Button>
        )
      }
    />
  );
}
