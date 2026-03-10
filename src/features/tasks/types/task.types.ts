export type TaskPriority = 1 | 2 | 3 | 4;

export type TaskStatus = "todo" | "in-progress" | "completed";

export interface Subtask {
  title: string;
  completed: boolean;
}

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  priority: TaskPriority;
  category?: string;
  project?: string;
  status: TaskStatus;
  subtasks?: Subtask[];
}
