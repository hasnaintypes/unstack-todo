import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/calendar/")({
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container py-10 max-w-screen-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Calendar</h1>
        <p className="text-muted-foreground">Calendar view coming soon...</p>
      </div>
    </div>
  );
}
