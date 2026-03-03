"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/context/calendar-context";
import { useState } from "react";

export function WorkingHoursSelector() {
  const { workingHours, setWorkingHours } = useCalendar();
  const [startHour, setStartHour] = useState(workingHours.start);
  const [endHour, setEndHour] = useState(workingHours.end);

  const handleApply = () => {
    if (startHour >= 0 && startHour < 24 && endHour >= 0 && endHour <= 24 && startHour < endHour) {
      setWorkingHours({ start: startHour, end: endHour });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-base font-semibold">Working Hours</Label>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="start-hour" className="w-20">
            From
          </Label>
          <Input
            id="start-hour"
            type="number"
            min={0}
            max={23}
            value={startHour}
            onChange={(e) => setStartHour(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm">:00</span>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="end-hour" className="w-20">
            To
          </Label>
          <Input
            id="end-hour"
            type="number"
            min={1}
            max={24}
            value={endHour}
            onChange={(e) => setEndHour(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm">:00</span>
        </div>
      </div>
      <Button onClick={handleApply} size="sm">
        Apply
      </Button>
      <p className="text-sm text-muted-foreground">
        Hours outside working hours will be shaded in day and week views (weekends are automatically
        non-working).
      </p>
    </div>
  );
}
