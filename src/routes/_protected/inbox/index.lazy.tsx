import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskAddDialog } from "@/features/tasks/components/task-add-dialog";
import { BatchDeleteDialog } from "@/features/tasks/components/batch-delete-dialog";
import { useInboxTasks } from "@/features/tasks/hooks/use-task-filters";
import { useTasks } from "@/shared/hooks/use-tasks";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { inboxTaskEmptyState } from "@/assets";

export const Route = createLazyFileRoute("/_protected/inbox/")({
  component: InboxPage,
});

function InboxPage() {
  const inboxTasks = useInboxTasks();
  const { addTask, updateTask, toggleTaskComplete, moveToTrash, setSelectedTask } = useTasks();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const handleAddTask = async (taskData: Partial<CalendarTask>) => {
    if (!taskData.title) return;

    await addTask({
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

  const handleEdit = useCallback((taskId: string, updates: Partial<CalendarTask>) => {
    updateTask(taskId, updates);
  }, [updateTask]);

  return (
    <>
      <TaskList
        title="Inbox"
        tasks={inboxTasks}
        onToggleComplete={toggleTaskComplete}
        onEdit={handleEdit}
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
