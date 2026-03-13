import type { FallbackProps } from "react-error-boundary";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 text-center">
      <AlertTriangle className="size-12 text-destructive" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        {error instanceof Error ? error.message : "An unexpected error occurred."}
      </p>
      <Button onClick={resetErrorBoundary} variant="outline">
        Try Again
      </Button>
    </div>
  );
}
