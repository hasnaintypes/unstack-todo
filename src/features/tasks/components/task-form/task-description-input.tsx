import * as React from "react";
import { AlignLeft, Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { hasAiKey, generateDescription } from "@/shared/services/ai.service";

interface TaskDescriptionInputProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  title: string;
}

export function TaskDescriptionInput({
  description,
  onDescriptionChange,
  title,
}: TaskDescriptionInputProps) {
  const [isGeneratingDesc, setIsGeneratingDesc] = React.useState(false);

  const handleGenerateDescription = async () => {
    if (!hasAiKey() || !title.trim() || isGeneratingDesc) return;
    setIsGeneratingDesc(true);
    try {
      const desc = await generateDescription(title.trim());
      if (desc) onDescriptionChange(desc);
    } catch {
      // silently fail
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center gap-1 shrink-0 mt-2">
        <AlignLeft className="h-5 w-5 text-muted-foreground/60" />
        {hasAiKey() && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={!title.trim() || isGeneratingDesc}
                  className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground/60 hover:text-brand hover:bg-brand/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isGeneratingDesc ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Generate description with AI</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Description"
        className="min-h-25 resize-none border-none bg-transparent p-2 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 leading-relaxed"
      />
    </div>
  );
}
