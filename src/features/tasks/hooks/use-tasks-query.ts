import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { taskService } from "@/features/tasks/services/task.service";
import { queryKeys } from "@/shared/lib/query-keys";
import type { CalendarTask } from "@/features/tasks/types/task.types";

export function useTasksQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasks.all(userId ?? ""),
    queryFn: () => taskService.getAllTasks(userId!),
    enabled: !!userId,
  });
}

export function useTrashTasksQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasks.trash(userId ?? ""),
    queryFn: () => taskService.getTrashTasks(userId!),
    enabled: !!userId,
  });
}

export function useAddTaskMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.tasks.all(userId ?? "");

  return useMutation({
    mutationFn: (taskData: Omit<CalendarTask, "id">) =>
      taskService.createTask(taskData, userId!),
    onMutate: async (taskData) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CalendarTask[]>(queryKey);
      const tempTask: CalendarTask = {
        ...taskData,
        id: `temp-${Date.now()}`,
      };
      queryClient.setQueryData<CalendarTask[]>(queryKey, (old) =>
        old ? [tempTask, ...old] : [tempTask]
      );
      return { previous };
    },
    onSuccess: (newTask, _vars, context) => {
      // Replace temp task with real one
      queryClient.setQueryData<CalendarTask[]>(queryKey, (old) => {
        if (!old) return [newTask];
        const filtered = old.filter((t) => !t.id.startsWith("temp-"));
        return [newTask, ...filtered];
      });
      toast.success(`"${newTask.title}" added to your tasks`, {
        description: newTask.dueDate ? `Due ${newTask.dueDate}` : "No due date set",
      });
      // Clear context to prevent onError rollback
      if (context) context.previous = undefined;
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Couldn't create task", {
        description: "Please check your connection and try again.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useAddTasksBatchMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.tasks.all(userId ?? "");

  return useMutation({
    mutationFn: (taskDataList: Omit<CalendarTask, "id">[]) =>
      taskService.createTasksBatch(taskDataList, userId!),
    onSuccess: (newTasks) => {
      queryClient.setQueryData<CalendarTask[]>(queryKey, (old) =>
        old ? [...newTasks, ...old] : newTasks
      );
    },
    onError: () => {
      toast.error("Couldn't create tasks", {
        description: "Please check your connection and try again.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateTaskMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.tasks.all(userId ?? "");

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CalendarTask> }) =>
      taskService.updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CalendarTask[]>(queryKey);
      queryClient.setQueryData<CalendarTask[]>(queryKey, (old) =>
        old?.map((task) => (task.id === id ? { ...task, ...updates } : task))
      );
      return { previous };
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<CalendarTask[]>(queryKey, (old) =>
        old?.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      toast.success("Changes saved", {
        description: `"${updatedTask.title}" has been updated.`,
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Couldn't save changes", {
        description: "Please check your connection and try again.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useToggleTaskCompleteMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.tasks.all(userId ?? "");

  return useMutation({
    mutationFn: async (id: string) => {
      let updatedTask = await taskService.toggleTaskComplete(id);

      // Auto-complete all subtasks when task is marked completed
      if (updatedTask.status === "completed" && updatedTask.subtasks?.length) {
        const allComplete = updatedTask.subtasks.map((s) => ({ ...s, completed: true }));
        updatedTask = await taskService.updateTask(id, { subtasks: allComplete });
      }

      // Auto-create next occurrence for recurring tasks
      if (updatedTask.status === "completed" && updatedTask.recurrence && userId) {
        try {
          const nextTask = await taskService.createNextOccurrence(updatedTask, userId);
          return { updatedTask, nextTask };
        } catch {
          return { updatedTask, nextTask: null };
        }
      }

      return { updatedTask, nextTask: null };
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CalendarTask[]>(queryKey);
      queryClient.setQueryData<CalendarTask[]>(queryKey, (old) =>
        old?.map((task) =>
          task.id === id
            ? {
                ...task,
                status: task.status === "completed" ? "todo" : "completed",
              }
            : task
        )
      );
      return { previous };
    },
    onSuccess: ({ updatedTask, nextTask }) => {
      queryClient.setQueryData<CalendarTask[]>(queryKey, (old) => {
        if (!old) return old;
        let updated = old.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        );
        if (nextTask) {
          updated = [nextTask, ...updated];
        }
        return updated;
      });

      if (nextTask) {
        toast.success(`"${updatedTask.title}" completed`, {
          description: `Next occurrence created for ${nextTask.dueDate}`,
        });
      } else {
        toast.success(
          updatedTask.status === "completed"
            ? `"${updatedTask.title}" completed`
            : `"${updatedTask.title}" reopened`,
          {
            description:
              updatedTask.status === "completed"
                ? "Great job! Keep up the momentum."
                : "Task is back on your active list.",
          }
        );
      }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Failed to toggle task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useMoveToTrashMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.tasks.all(userId ?? "");

  return useMutation({
    mutationFn: (id: string) => taskService.moveToTrash(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CalendarTask[]>(queryKey);
      queryClient.setQueryData<CalendarTask[]>(queryKey, (old) =>
        old?.filter((task) => task.id !== id)
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success("Moved to trash", {
        description: "Task will be permanently deleted after 30 days.",
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Couldn't move task to trash", {
        description: "Please check your connection and try again.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.trash(userId ?? "") });
    },
  });
}

export function useRestoreFromTrashMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.tasks.all(userId ?? "");
  const trashKey = queryKeys.tasks.trash(userId ?? "");

  return useMutation({
    mutationFn: (id: string) => taskService.restoreFromTrash(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: trashKey });
      const previousTrash = queryClient.getQueryData<CalendarTask[]>(trashKey);
      queryClient.setQueryData<CalendarTask[]>(trashKey, (old) =>
        old?.filter((task) => task.id !== id)
      );
      return { previousTrash };
    },
    onSuccess: (restoredTask) => {
      queryClient.setQueryData<CalendarTask[]>(queryKey, (old) =>
        old ? [restoredTask, ...old] : [restoredTask]
      );
      toast.success("Task restored", {
        description: `"${restoredTask.title}" is back in your tasks.`,
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTrash) {
        queryClient.setQueryData(trashKey, context.previousTrash);
      }
      toast.error("Couldn't restore task", {
        description: "Please check your connection and try again.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: trashKey });
    },
  });
}

export function usePermanentlyDeleteMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const trashKey = queryKeys.tasks.trash(userId ?? "");

  return useMutation({
    mutationFn: (id: string) => taskService.permanentlyDelete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: trashKey });
      const previous = queryClient.getQueryData<CalendarTask[]>(trashKey);
      queryClient.setQueryData<CalendarTask[]>(trashKey, (old) =>
        old?.filter((task) => task.id !== id)
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success("Task permanently deleted");
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(trashKey, context.previous);
      }
      toast.error("Couldn't delete task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: trashKey });
    },
  });
}

export function useClearCompletedMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.tasks.all(userId ?? "");

  return useMutation({
    mutationFn: () => taskService.clearCompleted(userId!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CalendarTask[]>(queryKey);
      const completedCount = previous?.filter((t) => t.status === "completed").length ?? 0;
      queryClient.setQueryData<CalendarTask[]>(queryKey, (old) =>
        old?.filter((task) => task.status !== "completed")
      );
      return { previous, completedCount };
    },
    onSuccess: (_data, _vars, context) => {
      toast.success(
        `${context?.completedCount ?? 0} completed task${(context?.completedCount ?? 0) !== 1 ? "s" : ""} moved to trash`
      );
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Couldn't clear completed tasks");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.trash(userId ?? "") });
    },
  });
}

export function useEmptyTrashMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const trashKey = queryKeys.tasks.trash(userId ?? "");

  return useMutation({
    mutationFn: () => taskService.emptyTrash(userId!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: trashKey });
      const previous = queryClient.getQueryData<CalendarTask[]>(trashKey);
      queryClient.setQueryData<CalendarTask[]>(trashKey, []);
      return { previous };
    },
    onSuccess: () => {
      toast.success("Trash emptied", {
        description: "All trashed tasks have been permanently deleted.",
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(trashKey, context.previous);
      }
      toast.error("Couldn't empty trash");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: trashKey });
    },
  });
}

export function useRestoreAllFromTrashMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.tasks.all(userId ?? "");
  const trashKey = queryKeys.tasks.trash(userId ?? "");

  return useMutation({
    mutationFn: () => taskService.restoreAllFromTrash(userId!),
    onSuccess: () => {
      toast.success("All tasks restored", {
        description: "Tasks have been moved back to their original locations.",
      });
    },
    onError: () => {
      toast.error("Couldn't restore tasks");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: trashKey });
    },
  });
}
