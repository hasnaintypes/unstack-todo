import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowRight,
  Github,
  Code2,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/_public/_marketing/about/")({
  component: About,
});

const values = [
  {
    icon: Code2,
    title: "Open Source",
    description:
      "Unstack is fully open source. Inspect the code, contribute features, or fork it for your own use. Transparency isn't optional — it's foundational.",
    gradient: "group-hover:from-blue-500/10 group-hover:to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Your data stays yours. No tracking, no analytics on your tasks, no selling your information. We use Appwrite for secure, self-hostable backend services.",
    gradient: "group-hover:from-emerald-500/10 group-hover:to-teal-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Heart,
    title: "Built with Care",
    description:
      "Every feature is intentional. We'd rather ship fewer things that work beautifully than bloat the app with half-baked ideas.",
    gradient: "group-hover:from-rose-500/10 group-hover:to-pink-500/10",
    iconColor: "text-rose-500",
  },
];

const techStack = [
  { name: "React", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  { name: "TypeScript", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { name: "Appwrite", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
  { name: "Tailwind CSS", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  { name: "TanStack Router", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  { name: "Vite", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
];

function About() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-sm font-medium text-primary">About Us</span>
            </div>

            <div className="space-y-4 max-w-4xl">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                Built for people who
                <br />
                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-primary to-primary/80">
                  value their time
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Unstack is a task management app that respects your time, your privacy, and your
                attention. No bloat, no noise — just clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Why we built Unstack
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg">
              <p>
                Most task management tools try to do everything. They add project timelines, team
                chat, Gantt charts, and a dozen integrations — until the app meant to simplify your
                work becomes work itself.
              </p>
              <p>
                Unstack started with a different question:{" "}
                <span className="text-foreground font-medium">
                  what if a task app was fast enough to stay out of your way?
                </span>
              </p>
              <p>
                We built Unstack to be the app you open, add a task, and close in under three
                seconds. Keyboard-first, offline-ready, and designed to load instantly as a PWA. No
                onboarding wizards, no upsells — just a clean workspace that helps you focus on what
                matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
                Values
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              What we stand for
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[18rem]">
            {values.map((value) => (
              <div
                key={value.title}
                className={cn(
                  "group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card p-8 transition-all duration-500",
                  "hover:border-primary/30 hover:shadow-[0_0_40px_-15px_rgba(0,0,0,0.3)]"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    value.gradient
                  )}
                />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 border border-border/50 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <value.icon className={cn("transition-colors", value.iconColor)} size={24} />
                  </div>
                  <div className="space-y-3 max-w-[85%]">
                    <h4 className="text-xl font-bold tracking-tight text-foreground">
                      {value.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      {value.description}
                    </p>
                  </div>
                  <value.icon
                    className={cn(
                      "absolute -bottom-8 -right-8 w-32 h-32 opacity-[0.03]",
                      value.iconColor
                    )}
                    strokeWidth={1}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Powered by modern tools
          </h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Unstack is built on a modern, battle-tested stack — chosen for speed, reliability, and
            developer experience.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <span
                key={tech.name}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium transition-transform hover:scale-105",
                  tech.color
                )}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Ready to try it?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Start organizing your tasks in seconds. Free, open source, and built for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="group px-8 h-12 text-base font-semibold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Link to="/auth/sign-up">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full">
              <a
                href="https://github.com/hasnaintypes/unstack-todo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
