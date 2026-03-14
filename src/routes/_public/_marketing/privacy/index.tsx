import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout } from "@/shared/components/legal-page-layout";

export const Route = createFileRoute("/_public/_marketing/privacy/")({
  component: Privacy,
});

const sections = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: "We collect account details like your name, email, and profile image, plus content you create such as tasks, projects, categories, comments, reminders, and templates.",
  },
  {
    id: "how-we-use-information",
    title: "How We Use Your Information",
    body: "We use your data to run core features like authentication, syncing, reminders, and AI-powered assistance so your workflow stays fast, reliable, and personalized.",
  },
  {
    id: "storage-security",
    title: "Storage and Security",
    body: "Data is stored in secure cloud infrastructure with document-level permissions. We apply access control and operational safeguards to protect your account data and files.",
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: "You can review, update, export, or delete your personal data. Deleting your account permanently removes associated tasks, projects, categories, and uploaded files.",
  },
  {
    id: "contact",
    title: "Contact",
    body: "Questions about this policy? Reach out through our GitHub repository and we will help as quickly as possible.",
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

function Privacy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Legal"
      effectiveDate="March 14, 2026"
      sections={sections}
    />
  );
}
