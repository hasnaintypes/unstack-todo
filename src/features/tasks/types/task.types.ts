export type TaskColor = "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "gray";

export type TaskPriority = 1 | 2 | 3 | 4;

export type TaskStatus = "todo" | "in-progress" | "completed";

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  priority: TaskPriority;
  color: TaskColor;
  category?: string;
  project?: string;
  status: TaskStatus;
  subtasks?: string[];
}
