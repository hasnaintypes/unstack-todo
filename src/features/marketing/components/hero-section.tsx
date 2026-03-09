import { Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero Content */}
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Built for Smart Teams</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
              Your Daily Tasks
              <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-primary to-primary/80">
                Organized Effortlessly
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Unstack helps you manage daily tasks, assign teammates, and track progress — all in a
              simple, fast, and visual workspace.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="group px-8 h-12 text-base font-semibold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Link to="/auth/sign-up">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
