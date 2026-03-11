import { createContext } from "react";
import type { CalendarTask } from "@/features/tasks/types/task.types";

export interface TaskContextValue {
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

export const TaskContext = createContext<TaskContextValue | undefined>(undefined);
