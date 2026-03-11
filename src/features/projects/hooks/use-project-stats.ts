import { useMemo } from "react";
import type { CalendarTask } from "@/features/tasks/types/task.types";

export function useProjectStats(tasks: CalendarTask[]) {
  return useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const overdue = tasks.filter((t) => {
      if (!t.dueDate || t.status === "completed") return false;
      return new Date(t.dueDate) < new Date(new Date().toDateString());
    }).length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const p1 = tasks.filter((t) => t.priority === 4).length;
    const p2 = tasks.filter((t) => t.priority === 3).length;
    const p3 = tasks.filter((t) => t.priority === 2).length;
    const p4 = tasks.filter((t) => t.priority === 1).length;
    return { total, completed, inProgress, todo, overdue, completionPct, p1, p2, p3, p4 };
  }, [tasks]);
}
