import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskAddDialog } from "@/features/tasks/components/task-add-dialog";
import { BatchDeleteDialog } from "@/features/tasks/components/batch-delete-dialog";
import { useUpcomingTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/shared/hooks/use-tasks";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { upcomingTaskEmptyState } from "@/assets";

export const Route = createFileRoute("/_protected/upcoming/")({
  component: UpcomingPage,
});

function UpcomingPage() {
  const upcomingTasks = useUpcomingTasks();
  const { addTask, updateTask, toggleTaskComplete, moveToTrash } = useTasks();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CalendarTask | undefined>(undefined);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const handleAddTask = (taskData: Partial<CalendarTask>) => {
    addTask(taskData as Omit<CalendarTask, "id">);
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

  return (
    <>
      <TaskList
        title="Upcoming"
        tasks={upcomingTasks}
        onToggleComplete={toggleTaskComplete}
        onEdit={handleEditClick}
        onDelete={moveToTrash}
        onAddTask={() => setIsAddDialogOpen(true)}
        groupBy="dueDate"
        selectable
        onBatchDelete={(ids) => { setPendingDeleteIds(ids); setIsBatchDeleteOpen(true); }}
        persistKey="upcoming"
        emptyState={
          <TaskEmptyState
            image={upcomingTaskEmptyState}
            imageAlt="Empty upcoming"
            title="Upcoming"
            heading="No upcoming tasks"
            description="Schedule your future tasks to stay organized and prepared."
            onAddTask={() => setIsAddDialogOpen(true)}
          />
        }
      />

      <TaskAddDialog
        task={editingTask}
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={editingTask ? handleEditTask : handleAddTask}
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
    </>
  );
}
