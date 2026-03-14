import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/shared/components/legal-page-layout";

export const Route = createFileRoute("/_public/_marketing/terms/")({
  component: Terms,
});

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    body: "Welcome to Unstack Todo. By using our service, you agree to these terms. Please read them carefully before creating an account or using the application.",
  },
  {
    id: "use-of-service",
    title: "Use of Service",
    body: "Unstack Todo is a task management application. You may use it for personal or professional productivity. You agree not to misuse the service, including attempting to access it using methods other than the interface and instructions we provide.",
  },
  {
    id: "user-accounts",
    title: "User Accounts",
    body: "You are responsible for safeguarding your account credentials and for any activity that occurs under your account. You must provide accurate information when creating an account.",
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    body: "The service and its original content, features, and functionality are owned by Unstack Todo. You retain ownership of the content you create using the service, including tasks, projects, and any other user-generated data.",
  },
  {
    id: "termination",
    title: "Termination",
    body: "You may delete your account at any time from the profile settings. We reserve the right to suspend or terminate accounts that violate these terms. Upon deletion, your data will be permanently removed.",
  },
  {
    id: "changes-to-terms",
    title: "Changes to Terms",
    body: "We may update these terms from time to time. We will notify users of significant changes. Continued use of the service after changes constitutes acceptance of the new terms.",
  },
  {
    id: "contact",
    title: "Contact",
    body: "If you have questions about these terms, please reach out via our GitHub repository.",
    extra: (
      <p className="mt-4 text-sm text-muted-foreground">
        Repository:{" "}
        <a
          href="https://github.com/hasnaintypes/unstack-todo"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-4"
        >
          github.com/hasnaintypes/unstack-todo
        </a>
      </p>
    ),
  },
];

function Terms() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Legal"
      effectiveDate="March 14, 2026"
      sections={sections}
    />
  );
}
