import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/_marketing/terms/")({
  component: Terms,
});

function Terms() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: March 14, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          Welcome to Unstack Todo. By using our service, you agree to these terms. Please read them
          carefully before creating an account or using the application.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Use of Service</h2>
        <p className="text-muted-foreground leading-relaxed">
          Unstack Todo is a task management application. You may use it for personal or professional
          productivity. You agree not to misuse the service, including attempting to access it using
          methods other than the interface and instructions we provide.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. User Accounts</h2>
        <p className="text-muted-foreground leading-relaxed">
          You are responsible for safeguarding your account credentials and for any activity that
          occurs under your account. You must provide accurate information when creating an account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Termination</h2>
        <p className="text-muted-foreground leading-relaxed">
          You may delete your account at any time from the profile settings. We reserve the right to
          suspend or terminate accounts that violate these terms. Upon deletion, your data will be
          permanently removed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Changes to Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update these terms from time to time. We will notify users of significant changes.
          Continued use of the service after changes constitutes acceptance of the new terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">6. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions about these terms, please reach out via our GitHub repository at{" "}
          <a
            href="https://github.com/hasnaintypes/unstack-todo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            github.com/hasnaintypes/unstack-todo
          </a>
          .
        </p>
      </section>
    </div>
  );
}
