import { Inbox, Calendar, CalendarDays, CheckCircle2, Trash2 } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/shared/lib/utils";
import { useSidebar } from "@/shared/components/ui/sidebar";

const tabs = [
  { icon: Inbox, label: "Inbox", to: "/inbox" as const },
  { icon: Calendar, label: "Today", to: "/today" as const },
  { icon: CalendarDays, label: "Upcoming", to: "/upcoming" as const },
  { icon: CheckCircle2, label: "Done", to: "/completed" as const },
  { icon: Trash2, label: "Trash", to: "/trash" as const },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              onClick={() => setOpenMobile(false)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors",
                isActive
                  ? "text-brand"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <tab.icon className={cn("size-5", isActive && "stroke-[2.5]")} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
