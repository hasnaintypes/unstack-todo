import { createFileRoute } from "@tanstack/react-router";
import { CalendarProvider } from "@/context/calendar-context";
import { CalendarHeader, MonthView, DayView, WeekView, AddTaskButton } from "@/components/calendar";
import { DndProviderWrapper } from "@/components/calendar/dnd/dnd-provider";
import { useCalendar } from "@/context/calendar-context";
import type { CalendarTask } from "@/types/calendar";

export const Route = createFileRoute("/_protected/calendar/")({
  component: CalendarPage,
});

// Sample tasks for demonstration with new priority system and colors
const sampleTasks: CalendarTask[] = [
  {
    id: "1",
    title: "Team standup meeting",
    description: "Daily sync with the development team",
    dueDate: new Date().toISOString(),
    startTime: "09:00",
    endTime: "09:30",
    priority: 2,
    color: "blue",
    category: "Work",
    status: "todo",
  },
  {
    id: "2",
    title: "Complete project proposal",
    description: "Finalize the Q1 project proposal document",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 3,
    color: "orange",
    category: "Work",
    status: "in-progress",
  },
  {
    id: "3",
    title: "Gym workout",
    dueDate: new Date().toISOString(),
    startTime: "18:00",
    endTime: "19:00",
    priority: 1,
    color: "green",
    category: "Personal",
    status: "todo",
  },
  {
    id: "4",
    title: "Review PR #234",
    description: "Code review for authentication feature",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 4,
    color: "red",
    category: "Work",
    status: "todo",
  },
  {
    id: "5",
    title: "Dentist appointment",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: "14:00",
    endTime: "15:00",
    priority: 3,
    color: "purple",
    category: "Personal",
    status: "todo",
  },
  {
    id: "6",
    title: "Client presentation",
    description: "Present Q1 results to stakeholders",
    dueDate: new Date().toISOString(),
    startTime: "11:00",
    endTime: "12:30",
    priority: 4,
    color: "red",
    category: "Work",
    status: "todo",
  },
  {
    id: "7",
    title: "Lunch break",
    dueDate: new Date().toISOString(),
    startTime: "13:00",
    endTime: "14:00",
    priority: 1,
    color: "gray",
    category: "Personal",
    status: "todo",
  },
  {
    id: "8",
    title: "Code review session",
    description: "Review PRs from the team",
    dueDate: new Date().toISOString(),
    startTime: "15:00",
    endTime: "16:30",
    priority: 2,
    color: "blue",
    category: "Work",
    status: "todo",
  },
  {
    id: "9",
    title: "Design workshop",
    description: "Collaborate with design team on new features",
    dueDate: new Date().toISOString(),
    startTime: "10:00",
    endTime: "11:00",
    priority: 2,
    color: "yellow",
    category: "Work",
    status: "todo",
  },
  {
    id: "10",
    title: "Sprint planning",
    description: "Plan next sprint with the team",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: "14:00",
    endTime: "16:00",
    priority: 3,
    color: "orange",
    category: "Work",
    status: "todo",
  },
];

function CalendarContent() {
  const { view } = useCalendar();

  return (
    <DndProviderWrapper>
      {view === "month" && <MonthView />}
      {view === "week" && <WeekView />}
      {view === "day" && <DayView />}
    </DndProviderWrapper>
  );
}

function CalendarPage() {
  return (
    <CalendarProvider initialTasks={sampleTasks}>
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your tasks in calendar view
            </p>
          </div>
          <AddTaskButton />
        </div>

        <CalendarHeader />
        <CalendarContent />
      </div>
    </CalendarProvider>
  );
}
