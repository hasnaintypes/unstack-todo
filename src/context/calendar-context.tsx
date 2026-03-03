"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import type { CalendarView, CalendarTask, BadgeVariant, WorkingHours } from "@/types/calendar";

interface CalendarContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  tasks: CalendarTask[];
  setTasks: React.Dispatch<React.SetStateAction<CalendarTask[]>>;
  addTask: (task: CalendarTask) => void;
  updateTask: (id: string, task: Partial<CalendarTask>) => void;
  deleteTask: (id: string) => void;
  badgeVariant: BadgeVariant;
  setBadgeVariant: (variant: BadgeVariant) => void;
  workingHours: WorkingHours;
  setWorkingHours: (hours: WorkingHours) => void;
  visibleHoursStart: number;
  setVisibleHoursStart: (hour: number) => void;
  visibleHoursEnd: number;
  setVisibleHoursEnd: (hour: number) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: React.ReactNode;
  initialTasks?: CalendarTask[];
}

export function CalendarProvider({ children, initialTasks = [] }: CalendarProviderProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [tasks, setTasks] = useState<CalendarTask[]>(initialTasks);
  const [badgeVariant, setBadgeVariant] = useState<BadgeVariant>("colored");
  const [workingHours, setWorkingHours] = useState<WorkingHours>({ start: 9, end: 17 });
  const [visibleHoursStart, setVisibleHoursStart] = useState(6);
  const [visibleHoursEnd, setVisibleHoursEnd] = useState(22);

  const addTask = (task: CalendarTask) => {
    setTasks((prev) => [...prev, task]);
  };

  const updateTask = (id: string, updates: Partial<CalendarTask>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate,
      view,
      setView,
      tasks,
      setTasks,
      addTask,
      updateTask,
      deleteTask,
      badgeVariant,
      setBadgeVariant,
      workingHours,
      setWorkingHours,
      visibleHoursStart,
      setVisibleHoursStart,
      visibleHoursEnd,
      setVisibleHoursEnd,
    }),
    [selectedDate, view, tasks, badgeVariant, workingHours, visibleHoursStart, visibleHoursEnd]
  );

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar(): CalendarContextType {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
