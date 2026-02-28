import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_protected/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="container py-10 max-w-screen-2xl mx-auto px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
      <p className="text-muted-foreground mb-6">Manage your account details.</p>

      <div className="max-w-2xl rounded-xl border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full name</label>
          <Input placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea
            placeholder="Tell us about yourself"
            rows={4}
            className="border-input placeholder:text-muted-foreground dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
          />
        </div>
        <div className="flex justify-end">
          <Button>Save changes</Button>
        </div>
      </div>
    </div>
  );
}
