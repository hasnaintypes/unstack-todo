import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskAddDialog } from "@/features/tasks/components/task-add-dialog";
import { BatchDeleteDialog } from "@/features/tasks/components/batch-delete-dialog";
import { useTodayTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/shared/hooks/use-tasks";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { todayTaskEmptyState } from "@/assets";

export const Route = createFileRoute("/_protected/today/")({
  component: TodayPage,
});

function TodayPage() {
  const todayTasks = useTodayTasks();
  const { addTask, updateTask, toggleTaskComplete, moveToTrash, setSelectedTask } = useTasks();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const handleAddTask = async (taskData: Partial<CalendarTask>) => {
    await addTask({
      ...taskData,
      dueDate: taskData.dueDate || new Date().toISOString().split("T")[0],
    } as Omit<CalendarTask, "id">);
  };

  const handleEdit = useCallback((taskId: string, updates: Partial<CalendarTask>) => {
    updateTask(taskId, updates);
  }, [updateTask]);

  return (
    <>
      <TaskList
        title="Today"
        tasks={todayTasks}
        onToggleComplete={toggleTaskComplete}
        onEdit={handleEdit}
        onDelete={moveToTrash}
        onTaskClick={setSelectedTask}
        onAddTask={() => setIsAddDialogOpen(true)}
        groupBy="priority"
        selectable
        onBatchDelete={(ids) => { setPendingDeleteIds(ids); setIsBatchDeleteOpen(true); }}
        persistKey="today"
        emptyState={
          <TaskEmptyState
            image={todayTaskEmptyState}
            imageAlt="Empty today"
            title="Today"
            heading="A clear field ahead"
            description="All your tasks for today are complete. Add a new task to get started."
            onAddTask={() => setIsAddDialogOpen(true)}
          />
        }
      />

      <TaskAddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddTask}
        defaultDate={new Date()}
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
