import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskAddDialog } from "@/features/tasks/components/task-add-dialog";
import { BatchDeleteDialog } from "@/features/tasks/components/batch-delete-dialog";
import { useUpcomingTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/shared/hooks/use-tasks";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { upcomingTaskEmptyState } from "@/assets";

export const Route = createLazyFileRoute("/_protected/upcoming/")({
  component: UpcomingPage,
});

function UpcomingPage() {
  const upcomingTasks = useUpcomingTasks();
  const { addTask, updateTask, toggleTaskComplete, moveToTrash } = useTasks();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const handleAddTask = async (taskData: Partial<CalendarTask>) => {
    addTask(taskData as Omit<CalendarTask, "id">);
  };

  const handleEdit = useCallback((taskId: string, updates: Partial<CalendarTask>) => {
    updateTask(taskId, updates);
  }, [updateTask]);

  return (
    <>
      <TaskList
        title="Upcoming"
        tasks={upcomingTasks}
        onToggleComplete={toggleTaskComplete}
        onEdit={handleEdit}
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
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddTask}
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
