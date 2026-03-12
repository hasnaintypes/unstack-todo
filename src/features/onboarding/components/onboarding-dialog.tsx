import { useState } from "react";
import { Inbox, FolderKanban, Sparkles, Keyboard, ArrowRight, ArrowLeft, Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to Unstack",
    description: "Your personal task management app. Organize tasks, track progress, and stay productive.",
  },
  {
    title: "Here's what you can do",
    features: [
      { icon: Inbox, label: "Inbox", description: "Capture tasks quickly without organizing" },
      { icon: FolderKanban, label: "Projects", description: "Group tasks into projects with Kanban boards" },
      { icon: Sparkles, label: "AI Generation", description: "Let AI suggest tasks for your projects" },
      { icon: Keyboard, label: "Shortcuts", description: "N = new task, ? = shortcuts, Cmd+K = search" },
    ],
  },
  {
    title: "You're all set!",
    description: "Start by adding your first task or creating a project. You've got this.",
  },
];

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{current.title}</DialogTitle>
          {"description" in current && current.description && (
            <DialogDescription>{current.description}</DialogDescription>
          )}
        </DialogHeader>

        {"features" in current && current.features && (
          <div className="grid gap-3 py-4">
            {current.features.map((f) => (
              <div key={f.label} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e44232]/10">
                  <f.icon className="h-4 w-4 text-[#e44232]" />
                </div>
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLast && (
          <div className="flex justify-center py-4">
            <Rocket className="h-12 w-12 text-[#e44232]" />
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-[#e44232]" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={onComplete} className="bg-[#e44232] hover:bg-[#c3392b] text-white">
                Get Started
                <Rocket className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(step + 1)} className="bg-[#e44232] hover:bg-[#c3392b] text-white">
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
