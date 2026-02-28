"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { inboxTaskEmptyState } from "@/assets";
import { Button } from "@/components/ui/button";
import { TaskAddCard } from "./task-add-card";
import type { EmptyStateTaskInput } from "./task-add-card";

interface InboxEmptyStateProps {
  onAddTask: (task: EmptyStateTaskInput) => void;
}

export function InboxEmptyState({ onAddTask }: InboxEmptyStateProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = (task: EmptyStateTaskInput) => {
    onAddTask(task);
    setIsAdding(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      {/* Header Row: Heading on Left, Trigger on Right */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        </div>

        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-[#e44232] hover:bg-[#e44232]/5 hover:text-[#c3392b] font-semibold gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        {!isAdding ? (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            {/* Illustration */}
            <div className="mb-6">
              <img
                src={inboxTaskEmptyState}
                alt="Empty inbox"
                className="w-72 h-72 object-contain opacity-90"
              />
            </div>

            {/* Content */}
            <div className="space-y-2 max-w-sm">
              <h2 className="text-lg font-medium">What's on your mind?</h2>
              <p className="text-muted-foreground text-sm">
                Capture tasks that don't have a specific category. Everything
                you add here stays private.
              </p>
            </div>

            {/* Secondary CTA (Optional, but good for UX) */}
            {/* <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="mt-6 border-[#e44232]/20 text-[#e44232] hover:bg-[#e44232] hover:text-white transition-all"
            >
              Get Started
            </Button> */}
          </div>
        ) : (
          /* The Form - Replaces the illustration entirely */
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <TaskAddCard
              onAddTask={handleAddTask}
              onCancel={() => setIsAdding(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
