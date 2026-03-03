import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Grid3x3,
  Columns,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCalendar } from "@/context/calendar-context";
import { getRangeText, navigateDate, getTasksCount } from "@/lib/calendar-helpers";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function CalendarHeader() {
  const { selectedDate, setSelectedDate, view, setView, tasks } = useCalendar();

  const tasksCount = getTasksCount(tasks, selectedDate, view);

  const handlePrevious = () => {
    setSelectedDate(navigateDate(selectedDate, view, "previous"));
  };

  const handleNext = () => {
    setSelectedDate(navigateDate(selectedDate, view, "next"));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "size-12 rounded-lg",
            isToday && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={handleToday}
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-[9px] font-semibold leading-none">
              {format(new Date(), "MMM").toUpperCase()}
            </span>
            <span className="text-lg font-bold leading-none mt-0.5">{format(new Date(), "d")}</span>
          </div>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 min-w-50 justify-center">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-semibold">{getRangeText(view, selectedDate)}</span>
            {tasksCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {tasksCount} {tasksCount === 1 ? "task" : "tasks"}
              </Badge>
            )}
          </div>

          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View switcher */}
      <div className="flex items-center gap-1 border rounded-lg">
        <Button
          variant={view === "day" ? "default" : "ghost"}
          size="sm"
          className={cn("rounded-r-none border-r", view === "day" && "pointer-events-none")}
          onClick={() => setView("day")}
        >
          <List className="h-4 w-4 mr-2" />
          Day
        </Button>
        <Button
          variant={view === "week" ? "default" : "ghost"}
          size="sm"
          className={cn("rounded-none border-r", view === "week" && "pointer-events-none")}
          onClick={() => setView("week")}
        >
          <Columns className="h-4 w-4 mr-2" />
          Week
        </Button>
        <Button
          variant={view === "month" ? "default" : "ghost"}
          size="sm"
          className={cn("rounded-l-none", view === "month" && "pointer-events-none")}
          onClick={() => setView("month")}
        >
          <Grid3x3 className="h-4 w-4 mr-2" />
          Month
        </Button>
      </div>
    </div>
  );
}
