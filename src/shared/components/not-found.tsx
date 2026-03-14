import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { logo } from "@/assets";

export function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90 mb-16"
        >
          <img src={logo} alt="Unstack Logo" className="size-8 object-contain" />
          <span className="font-bold tracking-tight text-xl">Unstack</span>
        </Link>

        {/* 404 Number */}
        <div className="relative mb-8">
          <span className="text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-foreground/15 to-foreground/5 select-none">
            404
          </span>
        </div>

        {/* Message */}
        <div className="text-center space-y-3 mb-10 max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            asChild
            size="lg"
            className="group px-6 h-11 rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-6 h-11 rounded-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
