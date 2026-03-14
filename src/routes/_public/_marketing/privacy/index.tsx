import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/_marketing/privacy/")({
  component: Privacy,
});

function Privacy() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: March 14, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Information We Collect</h2>
        <p className="text-muted-foreground leading-relaxed">
          We collect information you provide when creating an account, including your name, email
          address, and profile picture. We also store the tasks, projects, and categories you create
          within the application.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          Your information is used to provide and improve the Unstack Todo service. This includes
          authenticating your account, storing your tasks, sending reminder notifications (when
          enabled), and generating AI-powered task suggestions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Data Storage</h2>
        <p className="text-muted-foreground leading-relaxed">
          Your data is stored securely using Appwrite cloud infrastructure. We implement
          document-level permissions to ensure only you can access your data. Files such as avatars
          and attachments are stored in secure cloud storage.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Your Rights</h2>
        <p className="text-muted-foreground leading-relaxed">
          You have the right to access, update, and delete your personal data at any time. You can
          export all your tasks from the Settings page. Deleting your account will permanently remove
          all associated data, including tasks, projects, categories, and uploaded files.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions about this privacy policy, please reach out via our GitHub repository
          at{" "}
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
