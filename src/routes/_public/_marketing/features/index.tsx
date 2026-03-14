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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/_public/_marketing/features/")({
  component: FeaturesPage,
});

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
  iconBg: string;
}

const allFeatures: Feature[] = [
  {
    icon: Inbox,
    title: "Smart Inbox",
    description:
      "Capture tasks instantly with a streamlined interface. No forms, no friction — just type, set a date, and move on. Everything lands in one clean feed.",
    gradient: "from-blue-500/15 to-cyan-500/10",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Calendar,
    title: "Today & Upcoming",
    description:
      "See what needs your attention right now. Filter by today or browse upcoming deadlines at a glance.",
    gradient: "from-purple-500/15 to-pink-500/10",
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Sparkles,
    title: "AI Task Generation",
    description:
      "Describe what you need and let AI break it down into actionable tasks with smart priorities. Powered by Gemini, routed through a secure server-side API.",
    gradient: "from-emerald-500/15 to-teal-500/10",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: FolderKanban,
    title: "Project Organization",
    description:
      "Group related tasks into projects with custom colors and icons. Keep work and personal life neatly separated.",
    gradient: "from-orange-500/15 to-amber-500/10",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    icon: Columns3,
    title: "Kanban Board",
    description:
      "Visualize your workflow with drag-and-drop columns. Move tasks between Todo, In Progress, and Done with a flick. See everything at a glance.",
    gradient: "from-indigo-500/15 to-violet-500/10",
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: Repeat,
    title: "Recurring Tasks",
    description:
      "Set tasks to repeat daily, weekly, on weekdays, or monthly. Build habits and never forget routine work.",
    gradient: "from-rose-500/15 to-pink-500/10",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    icon: Focus,
    title: "Focus Mode",
    description:
      "Minimize distractions and work on one task at a time. Toggle it from settings or trigger it with a keyboard shortcut to enter deep work instantly.",
    gradient: "from-amber-500/15 to-yellow-500/10",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    description:
      "Navigate, create, and manage tasks without ever touching your mouse. Power users rejoice.",
    gradient: "from-sky-500/15 to-blue-500/10",
    iconColor: "text-sky-500",
    iconBg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    icon: Zap,
    title: "Quick Add",
    description:
      "Press N anywhere in the app to instantly create a new task. Cmd+K opens the command palette. Speed is a feature, not an afterthought.",
    gradient: "from-lime-500/15 to-green-500/10",
    iconColor: "text-lime-500",
    iconBg: "bg-lime-500/10 border-lime-500/20",
  },
  {
    icon: ShieldCheck,
    title: "OAuth Sign-In",
    description:
      "Sign in securely with Google or Discord. No passwords to remember, no friction to start.",
    gradient: "from-green-500/15 to-emerald-500/10",
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10 border-green-500/20",
  },
  {
    icon: Smartphone,
    title: "PWA & Offline",
    description:
      "Install Unstack as a native app on any device. Works offline with service worker caching so you're never blocked — even without a connection.",
    gradient: "from-violet-500/15 to-purple-500/10",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Set reminders on any task and get notified at the right time. Never let a deadline slip.",
    gradient: "from-red-500/15 to-rose-500/10",
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10 border-red-500/20",
  },
];

function BentoCard({
  feature,
  size,
}: {
  feature: Feature;
  size: "small" | "large";
}) {
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
          feature.gradient
        )}
      />

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/[0.03] to-transparent rounded-bl-full" />

      <div className="relative z-10 h-full flex flex-col justify-between gap-6">
        <div className="space-y-4">
          {/* Icon */}
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-2",
              isLarge ? "h-14 w-14" : "h-12 w-12",
              feature.iconBg
            )}
          >
            <feature.icon
              className={cn("transition-colors", feature.iconColor)}
              size={isLarge ? 26 : 22}
            />
          </div>

          {/* Text */}
          <div className="space-y-2.5">
            <h3
              className={cn(
                "font-bold tracking-tight text-foreground",
                isLarge ? "text-2xl" : "text-xl"
              )}
            >
              {feature.title}
            </h3>
            <p
              className={cn(
                "text-muted-foreground leading-relaxed",
                isLarge
                  ? "text-base md:text-lg max-w-lg"
                  : "text-sm md:text-base"
              )}
            >
              {feature.description}
            </p>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-0.5 rounded-full transition-all duration-500 group-hover:w-12",
              isLarge ? "w-8" : "w-6",
              feature.iconBg.replace("bg-", "bg-").replace("/10", "/40")
            )}
            style={{
              backgroundColor: `var(--tw-gradient-from, currentColor)`,
              opacity: 0.3,
            }}
          />
        </div>
      </div>

      {/* Large background icon watermark */}
      <feature.icon
        className={cn(
          "absolute -bottom-6 -right-6 opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]",
          isLarge ? "w-40 h-40" : "w-28 h-28",
          feature.iconColor
        )}
        strokeWidth={0.8}
      />
    </div>
  );
}

function BentoGrid({ features }: { features: Feature[] }) {
  // Pair features into rows: alternating small+big, big+small
  const rows: { features: Feature[]; pattern: "small-big" | "big-small" }[] =
    [];
  let i = 0;
  let rowIndex = 0;

  while (i < features.length) {
    const isSmallBig = rowIndex % 2 === 0;
    const remaining = features.length - i;

    if (remaining >= 2) {
      rows.push({
        features: [features[i], features[i + 1]],
        pattern: isSmallBig ? "small-big" : "big-small",
      });
      i += 2;
    } else {
      // Single remaining feature gets full width
      rows.push({
        features: [features[i]],
        pattern: isSmallBig ? "small-big" : "big-small",
      });
      i += 1;
    }
    rowIndex++;
  }

  return (
    <div className="space-y-6">
      {rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {row.features.length === 2 ? (
            row.pattern === "small-big" ? (
              <>
                <BentoCard feature={row.features[0]} size="small" />
                <BentoCard feature={row.features[1]} size="large" />
              </>
            ) : (
              <>
                <BentoCard feature={row.features[0]} size="large" />
                <BentoCard feature={row.features[1]} size="small" />
              </>
            )
          ) : (
            <div className="md:col-span-3">
              <BentoCard feature={row.features[0]} size="large" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionHeader({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
          {badge}
        </span>
      </div>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FeaturesPage() {
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
              <span className="text-sm font-medium text-primary">
                Feature Overview
              </span>
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
                From quick task capture to AI-powered generation, Unstack has
                the tools to keep you focused and organized.
              </p>
            </div>

            {/* Feature count pills */}
            <div className="flex items-center gap-3 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                12 Features
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                Free & Open Source
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                Works Offline
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features — first 6 */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Core"
            title="Built for speed. Designed for clarity."
            subtitle="The essentials you need to capture, organize, and ship your work."
          />
          <BentoGrid features={allFeatures.slice(0, 6)} />
        </div>
      </section>

      {/* Productivity — features 6-8 */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Productivity"
            title="Work smarter, not harder"
            subtitle="Tools designed for power users who value every second."
          />
          <BentoGrid features={allFeatures.slice(6, 9)} />
        </div>
      </section>

      {/* Platform — features 9-11 */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            badge="Platform"
            title="Ready anywhere you are"
            subtitle="Sign in with your favorite provider, install as a PWA, and never miss a reminder."
          />
          <BentoGrid features={allFeatures.slice(9, 12)} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join Unstack and start organizing your tasks in seconds. No credit
            card required.
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
