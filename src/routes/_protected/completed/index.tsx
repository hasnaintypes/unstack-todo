import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CompletedEmptyState } from "@/components/empty-states";

export const Route = createFileRoute("/_protected/completed/")({
  component: CompletedPage,
});

function CompletedPage() {
  const [tasks] = useState<unknown[]>([]);

  return (
    <div className="flex-1 overflow-y-auto">
      {tasks.length === 0 ? (
        <CompletedEmptyState />
      ) : (
        <div className="container py-10 max-w-screen-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Completed</h1>
          {/* Completed tasks list will go here */}
        </div>
      )}
    </div>
  );
}
