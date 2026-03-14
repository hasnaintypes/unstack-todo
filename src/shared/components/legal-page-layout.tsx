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
    <div className="bg-background">
      {/* Header */}
      <section className="px-4 pt-20 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {subtitle && (
            <p className="text-sm font-medium text-primary mb-3">{subtitle}</p>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Effective: {effectiveDate}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10">
          {sections.map((section) => (
            <div key={section.id} id={section.id}>
              <h2 className="text-lg font-semibold text-foreground">
                {section.title}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {section.body}
              </p>
              {section.extra}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
