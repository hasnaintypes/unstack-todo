import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowRight,
  Github,
  Code2,
  ShieldCheck,
  Heart,
  Zap,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/_public/_marketing/about/")({
  component: About,
});

interface Value {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
  iconBg: string;
}

const values: Value[] = [
  {
    icon: Code2,
    title: "Open Source",
    description:
      "Unstack is fully open source. Inspect the code, contribute features, or fork it for your own use. Transparency isn't optional — it's foundational.",
    gradient: "from-blue-500/15 to-cyan-500/10",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Your data stays yours. No tracking, no analytics on your tasks, no selling your information. We use Appwrite for secure, self-hostable backend services.",
    gradient: "from-emerald-500/15 to-teal-500/10",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Heart,
    title: "Built with Care",
    description:
      "Every feature is intentional. We'd rather ship fewer things that work beautifully than bloat the app with half-baked ideas. Quality over quantity, always.",
    gradient: "from-rose-500/15 to-pink-500/10",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: Zap,
    title: "Speed Obsessed",
    description:
      "Every interaction is optimized for speed. Instant task creation, keyboard shortcuts everywhere, lazy-loaded routes, and offline-first PWA. No loading spinners.",
    gradient: "from-amber-500/15 to-yellow-500/10",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10 border-amber-500/20",
  },
];

const techStack = [
  { name: "React 19", icon: "~", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  { name: "TypeScript", icon: "TS", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { name: "Appwrite", icon: "AW", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
  { name: "Tailwind CSS", icon: "TW", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  { name: "TanStack Router", icon: "TR", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  { name: "Vite", icon: "V", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  { name: "shadcn/ui", icon: "UI", color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" },
  { name: "React Query", icon: "RQ", color: "text-red-500 bg-red-500/10 border-red-500/20" },
];

function ValueCard({ value, size }: { value: Value; size: "small" | "large" }) {
  const isLarge = size === "large";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/50 bg-card transition-all duration-500",
        "hover:border-primary/30 hover:shadow-[0_0_50px_-20px_rgba(0,0,0,0.25)]",
        isLarge ? "md:col-span-2 p-8 md:p-10" : "md:col-span-1 p-8"
      )}
    >
      {/* Gradient background on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          value.gradient
        )}
      />

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/[0.03] to-transparent rounded-bl-full" />

      <div className="relative z-10 h-full flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-2",
              isLarge ? "h-14 w-14" : "h-12 w-12",
              value.iconBg
            )}
          >
            <value.icon
              className={cn("transition-colors", value.iconColor)}
              size={isLarge ? 26 : 22}
            />
          </div>

          <div className="space-y-2.5">
            <h3
              className={cn(
                "font-bold tracking-tight text-foreground",
                isLarge ? "text-2xl" : "text-xl"
              )}
            >
              {value.title}
            </h3>
            <p
              className={cn(
                "text-muted-foreground leading-relaxed",
                isLarge ? "text-base md:text-lg max-w-lg" : "text-sm md:text-base"
              )}
            >
              {value.description}
            </p>
          </div>
        </div>
      </div>

      {/* Background icon watermark */}
      <value.icon
        className={cn(
          "absolute -bottom-6 -right-6 opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]",
          isLarge ? "w-40 h-40" : "w-28 h-28",
          value.iconColor
        )}
        strokeWidth={0.8}
      />
    </div>
  );
}

function About() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
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

            {/* Quick stats */}
            <div className="flex items-center gap-3 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                <Globe className="size-3" />
                Open Source
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3" />
                Privacy First
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                <Zap className="size-3" />
                Free Forever
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — heading + highlight */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
                  Our Story
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Why we built
                <br />
                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/80">
                  Unstack
                </span>
              </h2>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <p className="text-foreground font-medium text-lg leading-relaxed">
                  &ldquo;What if a task app was fast enough to stay out of your way?&rdquo;
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  The question that started everything.
                </p>
              </div>
            </div>

            {/* Right — story text */}
            <div className="space-y-5 text-muted-foreground leading-relaxed text-base md:text-lg">
              <p>
                Most task management tools try to do everything. They add project timelines, team
                chat, Gantt charts, and a dozen integrations — until the app meant to simplify your
                work becomes work itself.
              </p>
              <p>
                We built Unstack to be the app you open, add a task, and close in under three
                seconds. Keyboard-first, offline-ready, and designed to load instantly as a PWA.
              </p>
              <p>
                No onboarding wizards, no upsells, no enterprise pricing walls — just a clean workspace
                that helps you focus on what matters. And it's{" "}
                <span className="text-foreground font-medium">completely open source</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values — alternating bento grid */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
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
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Principles that guide every line of code we write.
            </p>
          </div>

          {/* Alternating bento: small+big, big+small */}
          <div className="space-y-6">
            {/* Row 1: small + big */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ValueCard value={values[0]} size="small" />
              <ValueCard value={values[1]} size="large" />
            </div>
            {/* Row 2: big + small */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ValueCard value={values[2]} size="large" />
              <ValueCard value={values[3]} size="small" />
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
                Stack
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Powered by modern tools
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Built on a battle-tested stack — chosen for speed, reliability, and developer experience.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
                  "hover:shadow-[0_0_30px_-12px_rgba(0,0,0,0.2)] hover:scale-[1.02]",
                  tech.color
                )}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-lg font-bold opacity-60">{tech.icon}</span>
                  <span className="text-sm font-semibold">{tech.name}</span>
                </div>
              </div>
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
