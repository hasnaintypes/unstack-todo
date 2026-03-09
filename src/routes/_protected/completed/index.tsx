import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskAddDialog } from "@/features/tasks/components/task-add-dialog";
import { Button } from "@/shared/components/ui/button";
import { ArchiveRestore } from "lucide-react";
import { useCompletedTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/app/providers/task-provider";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { completedTaskEmptyState } from "@/assets";

export const Route = createFileRoute("/_protected/completed/")({
  component: CompletedPage,
});

function CompletedPage() {
  const completedTasks = useCompletedTasks();
  const { addTask, updateTask, toggleTaskComplete, moveToTrash, clearCompleted } = useTasks();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CalendarTask | undefined>(undefined);

  const handleAddTask = (taskData: Partial<CalendarTask>) => {
    addTask({
      ...taskData,
      status: "completed",
    } as Omit<CalendarTask, "id">);
  };

  const handleEditTask = (taskData: Partial<CalendarTask>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(undefined);
    }
  };

  const handleEditClick = (task: CalendarTask) => {
    setEditingTask(task);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingTask(undefined);
    }
    setIsAddDialogOpen(open);
  };

  const handleClearCompleted = () => {
    if (confirm("Are you sure you want to clear all completed tasks?")) {
      clearCompleted();
    }
  };

  return (
    <>
      <TaskList
        title="Completed"
        tasks={completedTasks}
        onToggleComplete={toggleTaskComplete}
        onEdit={handleEditClick}
        onDelete={moveToTrash}
        onAddTask={() => setIsAddDialogOpen(true)}
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

      <TaskAddDialog
        task={editingTask}
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={editingTask ? handleEditTask : handleAddTask}
      />
    </>
  );
}
