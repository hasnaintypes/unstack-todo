"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/context/calendar-context";
import { useState } from "react";

export function VisibleHoursSelector() {
  const { visibleHoursStart, visibleHoursEnd, setVisibleHoursStart, setVisibleHoursEnd } =
    useCalendar();
  const [startHour, setStartHour] = useState(visibleHoursStart);
  const [endHour, setEndHour] = useState(visibleHoursEnd);

  const handleApply = () => {
    if (startHour >= 0 && startHour < 24 && endHour >= 1 && endHour <= 24 && startHour < endHour) {
      setVisibleHoursStart(startHour);
      setVisibleHoursEnd(endHour);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-base font-semibold">Visible Hours Range</Label>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="visible-start-hour" className="w-20">
            From
          </Label>
          <Input
            id="visible-start-hour"
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
          <Label htmlFor="visible-end-hour" className="w-20">
            To
          </Label>
          <Input
            id="visible-end-hour"
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
        Control which hours are displayed in day and week views to focus on relevant time periods.
      </p>
    </div>
  );
}
