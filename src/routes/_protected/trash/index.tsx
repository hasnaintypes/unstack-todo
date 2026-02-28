import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrashEmptyState } from "@/components/empty-states";

export const Route = createFileRoute("/_protected/trash/")({
  component: TrashPage,
});

function TrashPage() {
  const [trashedTasks] = useState<unknown[]>([]);

  return (
    <div className="flex-1 overflow-y-auto">
      {trashedTasks.length === 0 ? (
        <TrashEmptyState />
      ) : (
        <div className="container py-10 max-w-screen-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Trash</h1>
          {/* Trashed tasks list will go here */}
        </div>
      )}
    </div>
  );
}
