import type { TaskPriority } from "@/features/tasks/types/task.types";

export function getPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Urgent",
  };
  return labels[priority];
}

/**
 * Returns Tailwind CSS classes for a priority level.
 * Used to derive color from priority instead of storing color on tasks.
 */
export function getPriorityConfig(priority: TaskPriority): {
  label: string;
  badgeClass: string;
  iconClass: string;
  bgClass: string;
} {
  const config: Record<
    TaskPriority,
    { label: string; badgeClass: string; iconClass: string; bgClass: string }
  > = {
    1: {
      label: "Low",
      badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      iconClass: "text-blue-500",
      bgClass: "bg-blue-500/10",
    },
    2: {
      label: "Medium",
      badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20",
      iconClass: "text-yellow-500",
      bgClass: "bg-yellow-500/10",
    },
    3: {
      label: "High",
      badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
      iconClass: "text-orange-500",
      bgClass: "bg-orange-500/10",
    },
    4: {
      label: "Urgent",
      badgeClass: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
      iconClass: "text-red-500",
      bgClass: "bg-red-500/10",
    },
  };
  return config[priority];
}
