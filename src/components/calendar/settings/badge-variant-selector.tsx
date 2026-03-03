"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/context/calendar-context";
import type { BadgeVariant } from "@/types/calendar";

export function BadgeVariantSelector() {
  const { badgeVariant, setBadgeVariant } = useCalendar();

  const variants: { value: BadgeVariant; label: string }[] = [
    { value: "colored", label: "Colored" },
    { value: "mixed", label: "Mixed" },
    { value: "dot", label: "Dot" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-base font-semibold">Task Badge Style</Label>
      </div>
      <div className="flex items-center gap-2">
        {variants.map((variant) => (
          <Button
            key={variant.value}
            variant={badgeVariant === variant.value ? "default" : "outline"}
            size="sm"
            onClick={() => setBadgeVariant(variant.value)}
          >
            {variant.label}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Choose how task badges are displayed in the calendar views.
      </p>
    </div>
  );
}
