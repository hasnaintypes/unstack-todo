import { cn } from "@/shared/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  helper?: string;
  progress?: number;
}

export function StatCard({ icon, label, value, color, helper, progress }: StatCardProps) {
  const normalizedProgress = Math.max(0, Math.min(progress ?? 0, 100));

  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-border hover:shadow-md">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("inline-flex size-6 items-center justify-center rounded-md bg-muted/40", color)}>
          {icon}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-3xl font-semibold tracking-tight", color)}>{value}</p>
      {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
      {typeof progress === "number" && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-500", color.replace("text-", "bg-"))}
            style={{ width: `${normalizedProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
