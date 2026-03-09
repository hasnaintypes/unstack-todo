import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/shared/components/ui/switch";
import { Button } from "@/shared/components/ui/button";

export const Route = createFileRoute("/_protected/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="container py-10 max-w-screen-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
      <p className="text-muted-foreground mb-6">Configure your workspace preferences.</p>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="max-w-2xl rounded-xl border bg-card p-6 space-y-6">
          <h2 className="text-xl font-semibold">General Settings</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates for task activity.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily summary</p>
              <p className="text-sm text-muted-foreground">Send daily productivity digest.</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto archive completed tasks</p>
              <p className="text-sm text-muted-foreground">
                Move old completed tasks to archive.
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex justify-end">
            <Button>Save preferences</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
