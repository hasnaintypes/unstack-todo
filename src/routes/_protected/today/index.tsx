import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
  const [editingTask, setEditingTask] = useState<CalendarTask | undefined>(undefined);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const handleAddTask = (taskData: Partial<CalendarTask>) => {
    addTask({
      ...taskData,
      dueDate: taskData.dueDate || new Date().toISOString().split("T")[0],
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

  return (
    <>
      <TaskList
        title="Today"
        tasks={todayTasks}
        onToggleComplete={toggleTaskComplete}
        onEdit={handleEditClick}
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
        task={editingTask}
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={editingTask ? handleEditTask : handleAddTask}
        defaultDate={editingTask ? undefined : new Date()}
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
