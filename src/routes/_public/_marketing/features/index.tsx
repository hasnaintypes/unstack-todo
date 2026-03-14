import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowRight,
  Inbox,
  Calendar,
  FolderKanban,
  Sparkles,
  Columns3,
  Repeat,
  Focus,
  Keyboard,
  Zap,
  ShieldCheck,
  Smartphone,
  Bell,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/_public/_marketing/features/")({
  component: FeaturesPage,
});

const coreFeatures = [
  {
    icon: Inbox,
    title: "Smart Inbox",
    description:
      "Capture tasks instantly with a streamlined interface. No forms, no friction — just type, set a date, and move on.",
    className: "md:col-span-2",
    gradient: "group-hover:from-blue-500/10 group-hover:to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Calendar,
    title: "Today & Upcoming Views",
    description:
      "See what needs your attention right now. Filter by today or browse upcoming deadlines at a glance.",
    className: "md:col-span-1",
    gradient: "group-hover:from-purple-500/10 group-hover:to-pink-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: FolderKanban,
    title: "Project Organization",
    description:
      "Group related tasks into projects with custom colors and icons. Keep work and personal life neatly separated.",
    className: "md:col-span-1",
    gradient: "group-hover:from-orange-500/10 group-hover:to-amber-500/10",
    iconColor: "text-orange-500",
  },
  {
    icon: Sparkles,
    title: "AI Task Generation",
    description:
      "Describe what you need and let AI break it down into actionable tasks. Powered by Gemini, routed through a secure API.",
    className: "md:col-span-2",
    gradient: "group-hover:from-emerald-500/10 group-hover:to-teal-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Columns3,
    title: "Kanban Board",
    description:
      "Visualize your workflow with drag-and-drop columns. Move tasks through stages effortlessly.",
    className: "md:col-span-1",
    gradient: "group-hover:from-indigo-500/10 group-hover:to-violet-500/10",
    iconColor: "text-indigo-500",
  },
  {
    icon: Repeat,
    title: "Recurring Tasks",
    description:
      "Set tasks to repeat daily, weekly, or monthly. Build habits and never forget routine work.",
    className: "md:col-span-2",
    gradient: "group-hover:from-rose-500/10 group-hover:to-pink-500/10",
    iconColor: "text-rose-500",
  },
];

const productivityTools = [
  {
    icon: Focus,
    title: "Focus Mode",
    description:
      "Minimize distractions and work on one task at a time. Toggle it from settings or with a keyboard shortcut.",
    gradient: "group-hover:from-amber-500/10 group-hover:to-yellow-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    description:
      "Navigate, create, and manage tasks without ever touching your mouse. Power users rejoice.",
    gradient: "group-hover:from-sky-500/10 group-hover:to-blue-500/10",
    iconColor: "text-sky-500",
  },
  {
    icon: Zap,
    title: "Quick Add",
    description:
      "Press N anywhere in the app to instantly create a new task. Speed is a feature.",
    gradient: "group-hover:from-lime-500/10 group-hover:to-green-500/10",
    iconColor: "text-lime-500",
  },
];

const platformFeatures = [
  {
    icon: ShieldCheck,
    title: "OAuth Sign-In",
    description:
      "Sign in securely with Google or Discord. No passwords to remember, no friction to start.",
    gradient: "group-hover:from-green-500/10 group-hover:to-emerald-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: Smartphone,
    title: "PWA & Offline",
    description:
      "Install Unstack as a native app on any device. Works offline so you're never blocked.",
    gradient: "group-hover:from-violet-500/10 group-hover:to-purple-500/10",
    iconColor: "text-violet-500",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Set reminders on any task and get notified at the right time. Never let a deadline slip.",
    gradient: "group-hover:from-red-500/10 group-hover:to-rose-500/10",
    iconColor: "text-red-500",
  },
];

function FeatureCard({
  feature,
}: {
  feature: {
    icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
    title: string;
    description: string;
    className?: string;
    gradient: string;
    iconColor: string;
  };
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card p-8 transition-all duration-500",
        "hover:border-primary/30 hover:shadow-[0_0_40px_-15px_rgba(0,0,0,0.3)]",
        feature.className
      )}
    >
      {/* Ambient Glow */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          feature.gradient
        )}
      />

      <div className="relative z-10 h-full flex flex-col">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 border border-border/50 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          <feature.icon className={cn("transition-colors", feature.iconColor)} size={24} />
        </div>

        <div className="space-y-3 max-w-[85%]">
          <h4 className="text-xl font-bold tracking-tight text-foreground">{feature.title}</h4>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {feature.description}
          </p>
        </div>

        {/* Background Icon */}
        <feature.icon
          className={cn("absolute -bottom-8 -right-8 w-32 h-32 opacity-[0.03]", feature.iconColor)}
          strokeWidth={1}
        />
      </div>
    </div>
  );
}

function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center text-center mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">{badge}</span>
      </div>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

function FeaturesPage() {
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
              <span className="text-sm font-medium text-primary">Feature Overview</span>
            </div>

            <div className="space-y-4 max-w-4xl">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                Everything you need
                <br />
                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-primary to-primary/80">
                  to stay productive
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                From quick task capture to AI-powered generation, Unstack has the tools to keep you
                focused and organized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Core"
            title="Built for speed. Designed for clarity."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[18rem]">
            {coreFeatures.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Productivity Tools */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Productivity"
            title="Work smarter, not harder"
            subtitle="Tools designed for power users who value every second."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[18rem]">
            {productivityTools.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Platform & Integrations */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Platform"
            title="Ready anywhere you are"
            subtitle="Sign in with your favorite provider, install as a PWA, and never miss a reminder."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[18rem]">
            {platformFeatures.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join Unstack and start organizing your tasks in seconds. No credit card required.
          </p>
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
        </div>
      </section>
    </div>
  );
}
