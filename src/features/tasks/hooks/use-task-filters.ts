import { useMemo, useState, useEffect } from "react";
import { isToday, isFuture, startOfDay } from "date-fns";
import { useTasks } from "@/shared/hooks/use-tasks";
import { taskService } from "@/features/tasks/services/task.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { CalendarTask } from "@/features/tasks/types/task.types";

/**
 * Hook to get tasks filtered for the Inbox view
 * Returns all tasks without a specific project or with project "inbox"
 */
export function useInboxTasks() {
  const { tasks } = useTasks();

  return useMemo(() => {
    return tasks.filter((task) => {
      if (task.status === "completed") return false;
      // Include tasks without project or with project "inbox"
      return !task.project || task.project === "inbox";
    });
  }, [tasks]);
}

/**
 * Hook to get tasks for Today view
 * Returns all tasks that are due today
 */
export function useTodayTasks() {
  const { tasks } = useTasks();

  return useMemo(() => {
    return tasks.filter((task) => {
      if (task.status === "completed") return false;
      if (!task.dueDate) return false;

      try {
        return isToday(new Date(task.dueDate));
      } catch {
        return false;
      }
    });
  }, [tasks]);
}

/**
 * Hook to get tasks for Upcoming view
 * Returns all tasks that are due in the future (not today)
 */
export function useUpcomingTasks() {
  const { tasks } = useTasks();

  return useMemo(() => {
    return tasks.filter((task) => {
      if (task.status === "completed") return false;
      if (!task.dueDate) return false;

      try {
        const date = new Date(task.dueDate);
        return isFuture(date) && !isToday(date);
      } catch {
        return false;
      }
    });
  }, [tasks]);
}

/**
 * Hook to get completed tasks
 */
export function useCompletedTasks() {
  const { tasks } = useTasks();

  return useMemo(() => {
    return tasks.filter((task) => task.status === "completed");
  }, [tasks]);
}

/**
 * Hook to get tasks in trash
 * Fetches tasks separately from Appwrite with deletedAt field
 */
export function useTrashTasks() {
  const { user } = useAuth();
  const [trashTasks, setTrashTasks] = useState<CalendarTask[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchTrash = async () => {
      if (!user?.$id) {
        if (mounted) setTrashTasks([]);
        return;
      }

      try {
        const tasks = await taskService.getTrashTasks(user.$id);
        if (mounted) setTrashTasks(tasks);
      } catch (err) {
        console.error("Error loading trash:", err);
        if (mounted) setTrashTasks([]);
      }
    };

    fetchTrash();

    return () => {
      mounted = false;
    };
  }, [user?.$id]);

  return trashTasks;
}

/**
 * Hook to get overdue tasks
 * Returns all incomplete tasks that are past due
 */
export function useOverdueTasks() {
  const { tasks } = useTasks();

  return useMemo(() => {
    const today = startOfDay(new Date());

    return tasks.filter((task) => {
      // Exclude completed tasks
      if (task.status === "completed") return false;

      // Include only overdue tasks
      if (!task.dueDate) return false;

      try {
        const taskDate = startOfDay(new Date(task.dueDate));
        return taskDate < today;
      } catch {
        return false;
      }
    });
  }, [tasks]);
}

/**
 * Hook to get tasks by project
 * Returns all tasks for a specific project
 */
export function useProjectTasks(projectId: string) {
  const { tasks } = useTasks();

  return useMemo(() => {
    return tasks.filter((task) => task.project === projectId);
  }, [tasks, projectId]);
}
