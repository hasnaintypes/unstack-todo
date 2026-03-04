import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskAddDialog } from "./task-add-dialog";
import { useCalendar } from "@/context/calendar-context";
import type { CalendarTask } from "@/types/calendar";

export function AddTaskButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addTask } = useCalendar();

  const handleSaveTask = (taskData: Partial<CalendarTask>) => {
    const newTask: CalendarTask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: taskData.title || "",
      description: taskData.description,
      dueDate: taskData.dueDate || new Date().toISOString().split("T")[0],
      startTime: taskData.startTime,
      endTime: taskData.endTime,
      priority: taskData.priority || 2,
      color: taskData.color || "blue",
      category: taskData.category,
      status: "todo",
      subtasks: taskData.subtasks,
    };

    addTask(newTask);
    setIsDialogOpen(false);
  };

  return (
    <TaskAddDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      onSave={handleSaveTask}
      trigger={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      }
    />
  );
}
