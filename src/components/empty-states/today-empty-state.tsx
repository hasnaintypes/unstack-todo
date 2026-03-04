"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { todayTaskEmptyState } from "@/assets";
import { Button } from "@/components/ui/button";
import { TaskAddDialog, type EmptyStateTaskInput } from "@/components/task";


interface TodayEmptyStateProps {
  onAddTask: (task: EmptyStateTaskInput) => void;
}

export function TodayEmptyState({ onAddTask }: TodayEmptyStateProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTask = (task: EmptyStateTaskInput) => {
    onAddTask(task);
    setIsOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Today</h1>

        {/* The Dialog Trigger in the Header */}
        <TaskAddDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          onAddTask={handleAddTask}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="text-[#e44232] hover:bg-[#e44232]/5 hover:text-[#c3392b] font-semibold gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          }
        />
      </div>

      {/* Main Content Area - Always shows illustration unless you're on a list view */}
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          {/* Illustration */}
          <div className="mb-6">
            <img
              src={todayTaskEmptyState}
              alt="Empty today"
              className="w-72 h-72 object-contain opacity-90"
            />
          </div>

          {/* Content */}
          <div className="space-y-2 max-w-sm mb-6">
            <h2 className="text-lg font-medium">A clear field ahead</h2>
            <p className="text-muted-foreground text-sm">
              All your tasks for today are complete. Add a new task to get started.
            </p>
          </div>

          {/* Big Button Trigger for Empty State */}
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-[#e44232] hover:bg-[#c3392b] text-white font-semibold px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first task
          </Button>
        </div>
      </div>
    </div>
  );
}
