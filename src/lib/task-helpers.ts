import type { TaskPriority } from "@/types/task";

export function getPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Urgent",
  };
  return labels[priority];
}
