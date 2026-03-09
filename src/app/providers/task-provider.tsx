import * as React from "react";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { taskService } from "@/features/tasks/services/task.service";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface TaskContextValue {
  tasks: CalendarTask[];
  isLoading: boolean;
  error: string | null;
  addTask: (task: Omit<CalendarTask, "id">) => Promise<void>;
  updateTask: (id: string, updates: Partial<CalendarTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  restoreFromTrash: (id: string) => Promise<void>;
  permanentlyDelete: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  emptyTrash: () => Promise<void>;
  restoreAllFromTrash: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = React.createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = React.useState<CalendarTask[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuth();

  // Load tasks from Appwrite when user is authenticated
  React.useEffect(() => {
    const loadTasks = async () => {
      if (!user?.$id) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedTasks = await taskService.getAllTasks(user.$id);
        setTasks(fetchedTasks);
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user?.$id]);

  const addTask = React.useCallback(async (taskData: Omit<CalendarTask, "id">) => {
    if (!user?.$id) {
      setError("User not authenticated");
      throw new Error("User not authenticated");
    }

    try {
      const newTask = await taskService.createTask(taskData, user.$id);
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task");
      throw err;
    }
  }, [user?.$id]);

  const updateTask = React.useCallback(async (id: string, updates: Partial<CalendarTask>) => {
    if (!user?.$id) {
      setError("User not authenticated");
      throw new Error("User not authenticated");
    }

    try {
      const updatedTask = await taskService.updateTask(id, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
      throw err;
    }
  }, [user?.$id]);

  const deleteTask = React.useCallback(async (id: string) => {
    try {
      await taskService.permanentlyDelete(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task");
      throw err;
    }
  }, []);

  const toggleTaskComplete = React.useCallback(async (id: string) => {
    try {
      const updatedTask = await taskService.toggleTaskComplete(id);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      console.error("Error toggling task:", err);
      setError("Failed to toggle task");
      throw err;
    }
  }, []);

  const moveToTrash = React.useCallback(async (id: string) => {
    try {
      await taskService.moveToTrash(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Error moving to trash:", err);
      setError("Failed to move task to trash");
      throw err;
    }
  }, []);

  const restoreFromTrash = React.useCallback(async (id: string) => {
    try {
      const restoredTask = await taskService.restoreFromTrash(id);
      setTasks((prev) => [restoredTask, ...prev]);
    } catch (err) {
      console.error("Error restoring task:", err);
      setError("Failed to restore task");
      throw err;
    }
  }, []);

  const permanentlyDelete = React.useCallback(async (id: string) => {
    try {
      await taskService.permanentlyDelete(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Error permanently deleting:", err);
      setError("Failed to permanently delete task");
      throw err;
    }
  }, []);

  const clearCompleted = React.useCallback(async () => {
    if (!user?.$id) return;

    try {
      await taskService.clearCompleted(user.$id);
      setTasks((prev) => prev.filter((task) => task.status !== "completed"));
    } catch (err) {
      console.error("Error clearing completed:", err);
      setError("Failed to clear completed tasks");
      throw err;
    }
  }, [user?.$id]);

  const emptyTrash = React.useCallback(async () => {
    if (!user?.$id) return;

    try {
      await taskService.emptyTrash(user.$id);
      // Refresh tasks after emptying trash
      const fetchedTasks = await taskService.getAllTasks(user.$id);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Error emptying trash:", err);
      setError("Failed to empty trash");
      throw err;
    }
  }, [user?.$id]);

  const restoreAllFromTrash = React.useCallback(async () => {
    if (!user?.$id) return;

    try {
      await taskService.restoreAllFromTrash(user.$id);
      const fetchedTasks = await taskService.getAllTasks(user.$id);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Error restoring all:", err);
      setError("Failed to restore all tasks");
      throw err;
    }
  }, [user?.$id]);

  const refreshTasks = React.useCallback(async () => {
    if (!user?.$id) return;

    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await taskService.getAllTasks(user.$id);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Error refreshing tasks:", err);
      setError("Failed to refresh tasks");
    } finally {
      setIsLoading(false);
    }
  }, [user?.$id]);

  const value: TaskContextValue = {
    tasks,
    isLoading,
    error,
    addTask,
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

export function useTasks() {
  const context = React.useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
