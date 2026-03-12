import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { TaskContext, type TaskContextValue } from "@/app/context/task-context";
import { queryKeys } from "@/shared/lib/query-keys";
import {
  useTasksQuery,
  useAddTaskMutation,
  useAddTasksBatchMutation,
  useUpdateTaskMutation,
  useToggleTaskCompleteMutation,
  useMoveToTrashMutation,
  useRestoreFromTrashMutation,
  usePermanentlyDeleteMutation,
  useClearCompletedMutation,
  useEmptyTrashMutation,
  useRestoreAllFromTrashMutation,
} from "@/features/tasks/hooks/use-tasks-query";

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.$id;
  const queryClient = useQueryClient();

  const [selectedTask, setSelectedTask] = React.useState<CalendarTask | null>(null);

  const { data: tasks = [], isLoading, error: queryError } = useTasksQuery(userId);
  const error = queryError ? "Failed to load tasks" : null;

  const addTaskMutation = useAddTaskMutation(userId);
  const addTasksBatchMutation = useAddTasksBatchMutation(userId);
  const updateTaskMutation = useUpdateTaskMutation(userId);
  const toggleMutation = useToggleTaskCompleteMutation(userId);
  const moveToTrashMutation = useMoveToTrashMutation(userId);
  const restoreFromTrashMutation = useRestoreFromTrashMutation(userId);
  const permanentlyDeleteMutation = usePermanentlyDeleteMutation(userId);
  const clearCompletedMutation = useClearCompletedMutation(userId);
  const emptyTrashMutation = useEmptyTrashMutation(userId);
  const restoreAllMutation = useRestoreAllFromTrashMutation(userId);

  const addTask = React.useCallback(
    async (taskData: Omit<CalendarTask, "id">) => {
      if (!userId) throw new Error("User not authenticated");
      await addTaskMutation.mutateAsync(taskData);
    },
    [userId, addTaskMutation]
  );

  const addTasksBatch = React.useCallback(
    async (taskDataList: Omit<CalendarTask, "id">[]): Promise<CalendarTask[]> => {
      if (!userId) throw new Error("User not authenticated");
      return addTasksBatchMutation.mutateAsync(taskDataList);
    },
    [userId, addTasksBatchMutation]
  );

  const updateTask = React.useCallback(
    async (id: string, updates: Partial<CalendarTask>) => {
      if (!userId) throw new Error("User not authenticated");
      const updatedTask = await updateTaskMutation.mutateAsync({ id, updates });
      setSelectedTask((prev) => (prev?.id === id ? updatedTask : prev));
    },
    [userId, updateTaskMutation]
  );

  const deleteTask = React.useCallback(
    async (id: string) => {
      await permanentlyDeleteMutation.mutateAsync(id);
    },
    [permanentlyDeleteMutation]
  );

  const toggleTaskComplete = React.useCallback(
    async (id: string) => {
      await toggleMutation.mutateAsync(id);
    },
    [toggleMutation]
  );

  const moveToTrash = React.useCallback(
    async (id: string) => {
      await moveToTrashMutation.mutateAsync(id);
    },
    [moveToTrashMutation]
  );

  const restoreFromTrash = React.useCallback(
    async (id: string) => {
      await restoreFromTrashMutation.mutateAsync(id);
    },
    [restoreFromTrashMutation]
  );

  const permanentlyDelete = React.useCallback(
    async (id: string) => {
      if (selectedTask?.id === id) setSelectedTask(null);
      await permanentlyDeleteMutation.mutateAsync(id);
    },
    [permanentlyDeleteMutation, selectedTask]
  );

  const clearCompleted = React.useCallback(async () => {
    if (!userId) return;
    await clearCompletedMutation.mutateAsync();
  }, [userId, clearCompletedMutation]);

  const emptyTrash = React.useCallback(async () => {
    if (!userId) return;
    await emptyTrashMutation.mutateAsync();
  }, [userId, emptyTrashMutation]);

  const restoreAllFromTrash = React.useCallback(async () => {
    if (!userId) return;
    await restoreAllMutation.mutateAsync();
  }, [userId, restoreAllMutation]);

  const refreshTasks = React.useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({
      queryKey: queryKeys.tasks.all(userId),
    });
  }, [userId, queryClient]);

  const value: TaskContextValue = {
    tasks,
    isLoading,
    error,
    selectedTask,
    setSelectedTask,
    addTask,
    addTasksBatch,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    moveToTrash,
    restoreFromTrash,
    permanentlyDelete,
    clearCompleted,
    emptyTrash,
    restoreAllFromTrash,
    refreshTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
