import type { Subtask, TaskPriority } from "@/features/tasks/types/task.types";

export interface TaskTemplate {
  id: string;
  userId: string;
  name: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  subtasks?: Subtask[];
  category?: string;
  project?: string;
}
