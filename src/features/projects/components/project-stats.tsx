import { CheckCircle2, Clock, AlertTriangle, ListTodo } from "lucide-react";
import { StatCard } from "./stat-card";
import { useProjectStats } from "../hooks/use-project-stats";
import type { CalendarTask } from "@/features/tasks/types/task.types";

interface ProjectStatsProps {
  tasks: CalendarTask[];
}

export function ProjectStatCards({ tasks }: ProjectStatsProps) {
  const stats = useProjectStats(tasks);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={<ListTodo className="size-4" />}
        label="Total"
        value={stats.total}
        color="text-foreground"
      />
      <StatCard
        icon={<CheckCircle2 className="size-4" />}
        label="Completed"
        value={stats.completed}
        color="text-green-500"
      />
      <StatCard
        icon={<Clock className="size-4" />}
        label="In Progress"
        value={stats.inProgress}
        color="text-blue-500"
      />
      <StatCard
        icon={<AlertTriangle className="size-4" />}
        label="Overdue"
        value={stats.overdue}
        color="text-red-500"
      />
    </div>
  );
}

export function ProjectCharts({ tasks }: ProjectStatsProps) {
  const stats = useProjectStats(tasks);
  const priorityBarTotal = stats.p1 + stats.p2 + stats.p3 + stats.p4 || 1;

  if (stats.total === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Completion Progress */}
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm font-medium text-muted-foreground mb-3">Completion</p>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold">{stats.completionPct}%</span>
          <span className="text-xs text-muted-foreground mb-1">
            {stats.completed}/{stats.total} tasks
          </span>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${stats.completionPct}%` }}
          />
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="rounded-xl border bg-card p-5">
        <p className="text-sm font-medium text-muted-foreground mb-3">Priority Distribution</p>
        <div className="flex gap-1.5 h-2.5 rounded-full overflow-hidden">
          {stats.p1 > 0 && (
            <div
              className="bg-red-500 rounded-full"
              style={{ width: `${(stats.p1 / priorityBarTotal) * 100}%` }}
            />
          )}
          {stats.p2 > 0 && (
            <div
              className="bg-orange-500 rounded-full"
              style={{ width: `${(stats.p2 / priorityBarTotal) * 100}%` }}
            />
          )}
          {stats.p3 > 0 && (
            <div
              className="bg-yellow-500 rounded-full"
              style={{ width: `${(stats.p3 / priorityBarTotal) * 100}%` }}
            />
          )}
          {stats.p4 > 0 && (
            <div
              className="bg-blue-500 rounded-full"
              style={{ width: `${(stats.p4 / priorityBarTotal) * 100}%` }}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-red-500" />
            Urgent ({stats.p1})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-orange-500" />
            High ({stats.p2})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-yellow-500" />
            Medium ({stats.p3})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500" />
            Low ({stats.p4})
          </span>
        </div>
      </div>
    </div>
  );
}
