import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";

export function ProjectNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-lg font-medium text-muted-foreground mb-4">Project not found</p>
      <Button variant="outline" onClick={() => navigate({ to: "/inbox" })}>
        Go to Inbox
      </Button>
    </div>
  );
}
