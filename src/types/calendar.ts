export type CalendarView = "day" | "week" | "month";

export type TaskPriority = 1 | 2 | 3 | 4; // 1: Low, 2: Medium, 3: High, 4: Urgent

export type TaskStatus = "todo" | "in-progress" | "completed";

export type TaskColor = "blue" | "green" | "red" | "yellow" | "purple" | "orange" | "gray";

export type BadgeVariant = "colored" | "mixed" | "dot";

export interface WorkingHours {
  start: number; // Hour (0-23)
  end: number; // Hour (0-23)
}

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  startTime?: string; // Optional time in HH:mm format
  endTime?: string; // Optional time in HH:mm format
  priority: TaskPriority;
  color: TaskColor;
  category?: string;
  status: TaskStatus;
  subtasks?: string[];
}

export interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: CalendarTask[];
}
