import { projectTaskEmptyState } from "@/assets";

export function TrashEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] px-4">
      <div className="mb-8">
        <img
          src={projectTaskEmptyState}
          alt="Trash is empty"
          className="w-64 h-64 object-contain"
        />
      </div>

      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">Trash is empty</h2>
        <p className="text-muted-foreground text-sm">Deleted tasks will appear here for 30 days.</p>
      </div>
    </div>
  );
}
