import { createFileRoute } from "@tanstack/react-router";
import { PersonalInfoCard } from "@/features/profile/components/personal-info-card";
import { SecurityCard } from "@/features/profile/components/security-card";
import { DangerZone } from "@/features/profile/components/danger-zone";

export const Route = createFileRoute("/_protected/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and set your profile preferences.
        </p>
      </div>

      <div className="space-y-6">
        <PersonalInfoCard />
        <SecurityCard />
        <DangerZone />
      </div>
    </div>
  );
}
