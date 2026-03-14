import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface LegalSection {
  id: string;
  title: string;
  body: string;
  extra?: ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export function LegalPageLayout({ title, subtitle, effectiveDate, sections }: LegalPageLayoutProps) {
  return (
    <div className="bg-background">
      {/* Hero — matches marketing pages */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-6">
            {subtitle && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-sm font-medium text-primary">{subtitle}</span>
              </div>
            )}

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
              {title}
            </h1>

            <p className="text-muted-foreground text-sm">
              Effective: {effectiveDate}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-border/50 bg-card p-5">
                <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-4">
                  On this page
                </h2>
                <ul className="space-y-2.5">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="group flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span className={cn(
                          "flex items-center justify-center size-5 rounded-md text-[10px] font-semibold border transition-colors",
                          "bg-muted/50 border-border/50 text-muted-foreground",
                          "group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary"
                        )}>
                          {index + 1}
                        </span>
                        <span className="transition-colors">
                          {section.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Sections */}
            <div className="space-y-5">
              {sections.map((section, index) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="group rounded-3xl border border-border/50 bg-card p-6 sm:p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_30px_-12px_rgba(0,0,0,0.1)]"
                >
                  <div className="flex items-start gap-4">
                    {/* Section number */}
                    <div className={cn(
                      "hidden sm:flex shrink-0 items-center justify-center size-9 rounded-xl border text-sm font-bold transition-colors",
                      "bg-muted/50 border-border/50 text-muted-foreground",
                      "group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary"
                    )}>
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="sm:hidden mb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-primary/60">
                        Section {index + 1}
                      </p>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {section.title}
                      </h3>
                      <p className="mt-3 leading-relaxed text-muted-foreground">
                        {section.body}
                      </p>
                      {section.extra}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
