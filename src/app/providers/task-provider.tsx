import * as React from "react";
import { toast } from "sonner";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { taskService } from "@/features/tasks/services/task.service";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface TaskContextValue {
  tasks: CalendarTask[];
  isLoading: boolean;
  error: string | null;
  selectedTask: CalendarTask | null;
  setSelectedTask: (task: CalendarTask | null) => void;
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
  const [selectedTask, setSelectedTask] = React.useState<CalendarTask | null>(null);
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
      toast.success(`"${newTask.title}" added to your tasks`, {
        description: newTask.dueDate ? `Due ${newTask.dueDate}` : "No due date set",
        action: { label: "Undo", onClick: () => moveToTrash(newTask.id) },
      });
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task");
      toast.error("Couldn't create task", {
        description: "Please check your connection and try again.",
      });
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
      toast.success("Changes saved", {
        description: `"${updatedTask.title}" has been updated.`,
      });
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
      toast.error("Couldn't save changes", {
        description: "Please check your connection and try again.",
      });
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
      toast.success(
        updatedTask.status === "completed"
          ? `"${updatedTask.title}" completed`
          : `"${updatedTask.title}" reopened`,
        {
          description: updatedTask.status === "completed"
            ? "Great job! Keep up the momentum."
            : "Task is back on your active list.",
          action: { label: "Undo", onClick: () => toggleTaskComplete(id) },
        }
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
      toast.success("Moved to trash", {
        description: "Task will be permanently deleted after 30 days.",
        action: { label: "Undo", onClick: () => restoreFromTrash(id) },
      });
    } catch (err) {
      console.error("Error moving to trash:", err);
      setError("Failed to move task to trash");
      toast.error("Couldn't move task to trash", {
        description: "Please check your connection and try again.",
      });
      throw err;
    }
  }, []);

  const restoreFromTrash = React.useCallback(async (id: string) => {
    try {
      const restoredTask = await taskService.restoreFromTrash(id);
      setTasks((prev) => [restoredTask, ...prev]);
      toast.success("Task restored", {
        description: `"${restoredTask.title}" is back in your tasks.`,
        action: { label: "Undo", onClick: () => moveToTrash(id) },
      });
    } catch (err) {
      console.error("Error restoring task:", err);
      setError("Failed to restore task");
      toast.error("Couldn't restore task", {
        description: "Please check your connection and try again.",
      });
      throw err;
    }
  }, []);

  const permanentlyDelete = React.useCallback(async (id: string) => {
    try {
      // Capture task before deleting for undo
      const deletedTask = tasks.find((t) => t.id === id);
      await taskService.permanentlyDelete(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      if (selectedTask?.id === id) setSelectedTask(null);
      toast.success("Task permanently deleted", {
        description: deletedTask ? `"${deletedTask.title}" has been removed.` : undefined,
        action: deletedTask && user?.$id
          ? {
              label: "Undo",
              onClick: async () => {
                try {
                  const restored = await taskService.createTask(
                    { title: deletedTask.title, description: deletedTask.description, dueDate: deletedTask.dueDate, priority: deletedTask.priority, category: deletedTask.category, project: deletedTask.project, status: deletedTask.status, subtasks: deletedTask.subtasks },
                    user.$id
                  );
                  setTasks((prev) => [restored, ...prev]);
                  toast.success("Task restored");
                } catch {
                  toast.error("Failed to undo delete");
                }
              },
            }
          : undefined,
      });
    } catch (err) {
      console.error("Error permanently deleting:", err);
      setError("Failed to permanently delete task");
      toast.error("Couldn't delete task");
      throw err;
    }
  }, [tasks, selectedTask, user?.$id]);

  const clearCompleted = React.useCallback(async () => {
    if (!user?.$id) return;

    try {
      const count = tasks.filter((t) => t.status === "completed").length;
      await taskService.clearCompleted(user.$id);
      setTasks((prev) => prev.filter((task) => task.status !== "completed"));
      toast.success(`${count} completed task${count !== 1 ? "s" : ""} moved to trash`);
    } catch (err) {
      console.error("Error clearing completed:", err);
      setError("Failed to clear completed tasks");
      toast.error("Couldn't clear completed tasks");
      throw err;
    }
  }, [user?.$id, tasks]);

  const emptyTrash = React.useCallback(async () => {
    if (!user?.$id) return;

    try {
      await taskService.emptyTrash(user.$id);
      const fetchedTasks = await taskService.getAllTasks(user.$id);
      setTasks(fetchedTasks);
      toast.success("Trash emptied", { description: "All trashed tasks have been permanently deleted." });
    } catch (err) {
      console.error("Error emptying trash:", err);
      setError("Failed to empty trash");
      toast.error("Couldn't empty trash");
      throw err;
    }
  }, [user?.$id]);

  const restoreAllFromTrash = React.useCallback(async () => {
    if (!user?.$id) return;

    try {
      await taskService.restoreAllFromTrash(user.$id);
      const fetchedTasks = await taskService.getAllTasks(user.$id);
      setTasks(fetchedTasks);
      toast.success("All tasks restored", { description: "Tasks have been moved back to their original locations." });
    } catch (err) {
      console.error("Error restoring all:", err);
      setError("Failed to restore all tasks");
      toast.error("Couldn't restore tasks");
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
    selectedTask,
    setSelectedTask,
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
