import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
  isSameWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  eachDayOfInterval,
  isToday,
} from "date-fns";
import type { CalendarView, CalendarTask, CalendarCell, TaskPriority } from "@/types/calendar";

// ================ Header helper functions ================ //

export function getRangeText(view: CalendarView, date: Date): string {
  switch (view) {
    case "day":
      return format(date, "MMMM d, yyyy");
    case "week": {
      const weekStart = startOfWeek(date, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
      return `${format(weekStart, "MMMM d")} - ${format(weekEnd, "MMMM d, yyyy")}`;
    }
    case "month":
      return format(date, "MMMM yyyy");
    default:
      return "";
  }
}

export function navigateDate(date: Date, view: CalendarView, direction: "previous" | "next"): Date {
  const operations = {
    month: direction === "next" ? addMonths : subMonths,
    week: direction === "next" ? addWeeks : subWeeks,
    day: direction === "next" ? addDays : subDays,
  };

  return operations[view](date, 1);
}

export function getTasksCount(tasks: CalendarTask[], date: Date, view: CalendarView): number {
  const compareFns = {
    day: isSameDay,
    week: isSameWeek,
    month: isSameMonth,
  };

  return tasks.filter((task) => compareFns[view](parseISO(task.dueDate), date)).length;
}

// ================ Month view helper functions ================ //

export function generateMonthCalendar(date: Date, tasks: CalendarTask[]): CalendarCell[][] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group days into weeks
  const weeks: CalendarCell[][] = [];
  let currentWeek: CalendarCell[] = [];

  days.forEach((day, index) => {
    const dayTasks = tasks.filter((task) => isSameDay(parseISO(task.dueDate), day));

    currentWeek.push({
      date: day,
      isCurrentMonth: isSameMonth(day, date),
      isToday: isToday(day),
      tasks: dayTasks,
    });

    // Start a new week every 7 days
    if ((index + 1) % 7 === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return weeks;
}

// ================ Week view helper functions ================ //

export function generateWeekDays(date: Date, tasks: CalendarTask[]): CalendarCell[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return days.map((day) => {
    const dayTasks = tasks.filter((task) => isSameDay(parseISO(task.dueDate), day));

    return {
      date: day,
      isCurrentMonth: isSameMonth(day, date),
      isToday: isToday(day),
      tasks: dayTasks,
    };
  });
}

// ================ Task helper functions ================ //

export function getTasksByDate(tasks: CalendarTask[], date: Date): CalendarTask[] {
  return tasks.filter((task) => isSameDay(parseISO(task.dueDate), date));
}

export function sortTasksByPriority(tasks: CalendarTask[]): CalendarTask[] {
  return [...tasks].sort((a, b) => b.priority - a.priority);
}

export function getPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Urgent",
  };
  return labels[priority];
}

// ================ Working hours helper functions ================ //

export function isWorkingHour(
  date: Date,
  hour: number,
  workingHours: { start: number; end: number }
): boolean {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (isWeekend) return false;

  return hour >= workingHours.start && hour < workingHours.end;
}
