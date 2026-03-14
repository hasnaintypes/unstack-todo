import type { ReactNode } from "react";

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
    <div className="mx-auto w-full max-w-6xl pb-10">
      {/* Gradient Hero */}
      <section className="relative overflow-hidden rounded-4xl border border-primary/15 bg-linear-to-br from-primary/95 via-primary to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-black/15 blur-3xl" />

        <div className="relative px-6 pb-40 pt-20 text-center sm:px-10">
          {subtitle && (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/80">
              {subtitle}
            </p>
          )}
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 text-sm text-primary-foreground/85">Effective: {effectiveDate}</p>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-[140%] -translate-x-1/2 translate-y-1/2 rounded-[100%] bg-background" />
      </section>

      {/* Content */}
      <section className="relative z-10 -mt-24 rounded-3xl border bg-background/95 p-4 shadow-xl backdrop-blur sm:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar TOC — hidden on mobile */}
          <aside className="hidden lg:block lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-2xl border bg-muted/40 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                On this page
              </h2>
              <ul className="mt-4 space-y-3">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <span className="text-xs font-semibold text-primary/80">{index + 1}.</span>
                      <span className="group-hover:underline group-hover:underline-offset-4">
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
                className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                  Section {index + 1}
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  {section.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
                {section.extra}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
