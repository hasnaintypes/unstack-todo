import { CheckCircle2, Clock, AlertTriangle, ListTodo } from "lucide-react";
import { StatCard } from "./stat-card";
import { useProjectStats } from "../hooks/use-project-stats";
import type { CalendarTask } from "@/features/tasks/types/task.types";

interface ProjectStatsProps {
  tasks: CalendarTask[];
}

export function ProjectStatCards({ tasks }: ProjectStatsProps) {
  const stats = useProjectStats(tasks);
  const total = Math.max(stats.total, 1);
  const inProgressPct = Math.round((stats.inProgress / total) * 100);
  const overduePct = Math.round((stats.overdue / total) * 100);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        icon={<ListTodo className="size-4" />}
        label="Total"
        value={stats.total}
        color="text-foreground"
        helper="All tasks in this project"
        progress={stats.total > 0 ? 100 : 0}
      />
      <StatCard
        icon={<CheckCircle2 className="size-4" />}
        label="Completed"
        value={stats.completed}
        color="text-green-500"
        helper={`${stats.completionPct}% completion rate`}
        progress={stats.completionPct}
      />
      <StatCard
        icon={<Clock className="size-4" />}
        label="In Progress"
        value={stats.inProgress}
        color="text-blue-500"
        helper={`${inProgressPct}% of project workload`}
        progress={inProgressPct}
      />
      <StatCard
        icon={<AlertTriangle className="size-4" />}
        label="Overdue"
        value={stats.overdue}
        color="text-red-500"
        helper={stats.overdue > 0 ? `${overduePct}% need attention` : "No overdue tasks"}
        progress={overduePct}
      />
    </div>
  );
}

export function ProjectCharts({ tasks }: ProjectStatsProps) {
  const stats = useProjectStats(tasks);
  const priorityBarTotal = stats.p1 + stats.p2 + stats.p3 + stats.p4 || 1;

  if (stats.total === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Completion Progress */}
      <div className="rounded-xl border border-border/60 bg-linear-to-br from-card/90 to-card/60 p-5 shadow-sm">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Completion</p>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-semibold tracking-tight">{stats.completionPct}%</span>
          <span className="mb-1 text-xs text-muted-foreground">
            {stats.completed}/{stats.total} tasks
          </span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-500 to-green-500 transition-all duration-500"
            style={{ width: `${stats.completionPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {stats.completed === stats.total
            ? "Everything is completed."
            : `${stats.total - stats.completed} task${stats.total - stats.completed === 1 ? "" : "s"} remaining`}
        </p>
      </div>

      {/* Priority Distribution */}
      <div className="rounded-xl border border-border/60 bg-linear-to-br from-card/90 to-card/60 p-5 shadow-sm">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Priority Distribution</p>
        <div className="flex h-2.5 gap-1.5 overflow-hidden rounded-full">
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
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-red-500" />
            Urgent ({stats.p1})
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-orange-500" />
            High ({stats.p2})
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-yellow-500" />
            Medium ({stats.p3})
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-blue-500" />
            Low ({stats.p4})
          </span>
        </div>
      </div>
    </div>
  );
}
