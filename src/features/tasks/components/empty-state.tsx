"use client";

import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface TaskEmptyStateProps {
  image: string;
  imageAlt: string;
  title: string;
  heading: string;
  description: string;
  showAddButton?: boolean;
  onAddTask?: () => void;
}

export function TaskEmptyState({
  image,
  imageAlt,
  title,
  heading,
  description,
  showAddButton = true,
  onAddTask,
}: TaskEmptyStateProps) {
  if (!showAddButton || !onAddTask) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <img src={image} alt={imageAlt} className="w-64 h-64 object-contain" loading="lazy" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-xl font-semibold">{heading}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddTask}
          className="text-brand hover:bg-brand/5 hover:text-brand-hover font-semibold gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          <div className="mb-6">
            <img src={image} alt={imageAlt} className="w-72 h-72 object-contain opacity-90" loading="lazy" />
          </div>

          <div className="space-y-2 max-w-sm mb-6">
            <h2 className="text-lg font-medium">{heading}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>

          <Button
            onClick={onAddTask}
            className="bg-brand hover:bg-brand-hover text-white font-semibold px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first task
          </Button>
        </div>
      </div>
    </div>
  );
}
