import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface QuickAddFABProps {
  onClick: () => void;
}

export function QuickAddFAB({ onClick }: QuickAddFABProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            aria-label="Add new task"
            className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-[#e44232] text-white shadow-lg transition-all hover:bg-[#c3392b] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#e44232]/50 focus:ring-offset-2"
          >
            <Plus className="size-6" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>New task (N)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
