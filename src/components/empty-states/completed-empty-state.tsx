import { completedTaskEmptyState } from "@/assets";

export function CompletedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] px-4">
      <div className="mb-8">
        <img
          src={completedTaskEmptyState}
          alt="No completed tasks"
          className="w-64 h-64 object-contain"
        />
      </div>

      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">No completed tasks yet</h2>
        <p className="text-muted-foreground text-sm">Tasks you complete will show here.</p>
      </div>
    </div>
  );
}
