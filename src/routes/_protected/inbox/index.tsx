import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskAddDialog } from "@/features/tasks/components/task-add-dialog";
import { BatchDeleteDialog } from "@/features/tasks/components/batch-delete-dialog";
import { useInboxTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/shared/hooks/use-tasks";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { inboxTaskEmptyState } from "@/assets";

export const Route = createFileRoute("/_protected/inbox/")({
  component: InboxPage,
});

function InboxPage() {
  const inboxTasks = useInboxTasks();
  const { addTask, updateTask, toggleTaskComplete, moveToTrash, setSelectedTask } = useTasks();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CalendarTask | undefined>(undefined);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const handleAddTask = (taskData: Partial<CalendarTask>) => {
    if (!taskData.title) return;

    addTask({
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate || "",
      priority: taskData.priority || 2,
      category: taskData.category,
      project: taskData.project || "inbox",
      status: taskData.status || "todo",
      subtasks: taskData.subtasks,
      tags: taskData.tags,
      recurrence: taskData.recurrence ?? null,
      reminderEnabled: taskData.reminderEnabled ?? false,
      reminderBefore: taskData.reminderBefore,
      attachments: taskData.attachments,
    });
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
        title="Inbox"
        tasks={inboxTasks}
        onToggleComplete={toggleTaskComplete}
        onEdit={handleEditClick}
        onDelete={moveToTrash}
        onTaskClick={setSelectedTask}
        onAddTask={() => setIsAddDialogOpen(true)}
        showProject={false}
        selectable
        onBatchDelete={(ids) => { setPendingDeleteIds(ids); setIsBatchDeleteOpen(true); }}
        persistKey="inbox"
        emptyState={
          <TaskEmptyState
            image={inboxTaskEmptyState}
            imageAlt="Empty inbox"
            title="Inbox"
            heading="What's on your mind?"
            description="Capture tasks that don't have a specific category. Everything you add here stays private."
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
