import { CheckCircle2, Inbox, Calendar, Flag, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Inbox,
    title: "Quick Task Capture",
    description: "Capture tasks instantly. Get them out of your head and into your system.",
    extendedDescription:
      "Our streamlined interface lets you add tasks in seconds. No complicated forms, no unnecessary clicks. Just type, set a date, and you're done.",
    highlights: ["Instant entry", "Shortcuts", "Natural Language"],
    className: "md:col-span-2",
    gradient: "group-hover:from-blue-500/10 group-hover:to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "View tasks by Today or Upcoming. Never miss a deadline.",
    className: "md:col-span-1",
    gradient: "group-hover:from-purple-500/10 group-hover:to-pink-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Flag,
    title: "Priority Levels",
    description: "Focus on what matters most with P1 to P3 priorities.",
    className: "md:col-span-1",
    gradient: "group-hover:from-red-500/10 group-hover:to-orange-500/10",
    iconColor: "text-red-500",
  },
  {
    icon: FolderKanban,
    title: "Task Categories",
    description: "Categorize as Personal or Work. Keep life organized.",
    extendedDescription:
      "Seamlessly organize your tasks into meaningful categories. Separate work commitments from personal goals, or create custom categories that match your workflow.",
    highlights: ["Work & Personal tags", "Custom categories", "Quick filtering"],
    className: "md:col-span-2",
    gradient: "group-hover:from-orange-500/10 group-hover:to-amber-500/10",
    iconColor: "text-orange-500", // Matches your screenshot
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
              Features
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Built for speed. <br />
            <span className="text-muted-foreground/40">Designed for clarity.</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[22rem]">
          {features.map((feature, i) => (
            <div
              key={i}
              className={cn(
                "group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card p-8 transition-all duration-500",
                "hover:border-primary/30 hover:shadow-[0_0_40px_-15px_rgba(0,0,0,0.3)]",
                feature.className
              )}
            >
              {/* Subtle Ambient Glow */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                  feature.gradient
                )}
              />

              <div className="relative z-10 h-full flex flex-col">
                {/* Icon Box */}
                <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 border border-border/50 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon className={cn("transition-colors", feature.iconColor)} size={24} />
                </div>

                <div className="space-y-4 max-w-[80%]">
                  <h4 className="text-2xl font-bold tracking-tight text-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>

                  {/* Extended Content for 2-column cards */}
                  {feature.extendedDescription && (
                    <p className="text-xs md:text-sm text-muted-foreground/60 leading-relaxed hidden md:block">
                      {feature.extendedDescription}
                    </p>
                  )}

                  {/* Tags / Highlights (Matching your image) */}
                  {feature.highlights && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {feature.highlights.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/5 border border-orange-500/20 text-[11px] font-medium text-orange-500/80"
                        >
                          <CheckCircle2 size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Background Icon */}
                <feature.icon
                  className={cn(
                    "absolute -bottom-8 -right-8 w-40 h-40 opacity-[0.03]",
                    feature.iconColor
                  )}
                  strokeWidth={1}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
