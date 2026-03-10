import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { TaskDetailContent } from "./task-detail-content";

interface TaskDetailsSheetProps {
  task: CalendarTask;
  children: React.ReactNode;
}

export function TaskDetailsSheet({ task, children }: TaskDetailsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-semibold leading-tight pr-6">
            {task.title}
          </SheetTitle>
        </SheetHeader>

        <TaskDetailContent task={task} />
      </SheetContent>
    </Sheet>
  );
}
