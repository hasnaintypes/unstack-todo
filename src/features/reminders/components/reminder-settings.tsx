import { useState, useEffect } from "react";
import { Bell, Clock, Mail, MessageCircle, Link, Unlink, Loader2 } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { reminderService } from "../services/reminder.service";
import type { UserReminderPreferences } from "../types/reminder.types";

function SettingRow({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function ReminderSettings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserReminderPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;
    let cancelled = false;
    reminderService.getPreferences(user.$id).then((p) => {
      if (!cancelled) {
        setPrefs(p);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.$id]);

  const updatePref = async (
    key: keyof Omit<UserReminderPreferences, "id" | "userId">,
    value: unknown
  ) => {
    if (!prefs?.id) return;
    try {
      const updated = await reminderService.updatePreferences(prefs.id, { [key]: value });
      setPrefs(updated);
    } catch {
      toast.error("Failed to update preference");
    }
  };

  if (isLoading || !prefs) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Notifications</h2>
          </div>
          <p className="text-xs text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Notifications</h2>
        </div>
        <p className="text-xs text-muted-foreground">Control how you receive task reminders</p>
      </div>
      <Separator />
      <div className="p-6 space-y-5">
        <SettingRow
          icon={<Mail className="size-4" />}
          title="Email reminders"
          description="Receive email notifications before task deadlines"
        >
          <Switch
            checked={prefs.emailEnabled}
            onCheckedChange={(checked) => updatePref("emailEnabled", checked)}
          />
        </SettingRow>

        <DiscordSection prefs={prefs} updatePref={updatePref} />

        <SettingRow
          icon={<Clock className="size-4" />}
          title="Daily summary"
          description="Get a daily digest of upcoming tasks"
        >
          <Switch
            checked={prefs.dailySummaryEnabled}
            onCheckedChange={(checked) => updatePref("dailySummaryEnabled", checked)}
          />
        </SettingRow>
      </div>
    </div>
  );
}

function DiscordSection({
  prefs,
  updatePref,
}: {
  prefs: UserReminderPreferences;
  updatePref: (key: keyof Omit<UserReminderPreferences, "id" | "userId">, value: unknown) => Promise<void>;
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [discordIdInput, setDiscordIdInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const isConnected = !!prefs.discordUserId;

  const handleConnect = async () => {
    const id = discordIdInput.trim();
    if (!id) {
      toast.error("Please enter your Discord user ID");
      return;
    }
    if (!/^\d{17,20}$/.test(id)) {
      toast.error("Invalid Discord user ID. It should be a 17-20 digit number.");
      return;
    }

    setIsConnecting(true);
    try {
      await updatePref("discordUserId", id);
      await updatePref("discordEnabled", true);
      setShowInput(false);
      setDiscordIdInput("");
      toast.success("Discord connected!");
    } catch {
      toast.error("Failed to connect Discord");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      await updatePref("discordEnabled", false);
      await updatePref("discordUserId", null);
      toast.success("Discord disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
            <MessageCircle className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Discord notifications</p>
            <p className="text-xs text-muted-foreground">
              {isConnected
                ? `Connected (ID: ${prefs.discordUserId})`
                : "Get DM reminders via Discord bot"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Switch
                checked={prefs.discordEnabled}
                onCheckedChange={(checked) => updatePref("discordEnabled", checked)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isConnecting}
                className="text-destructive hover:text-destructive"
              >
                {isConnecting ? <Loader2 className="size-4 animate-spin" /> : <Unlink className="size-4" />}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInput(!showInput)}
            >
              <Link className="size-4 mr-1.5" />
              Connect
            </Button>
          )}
        </div>
      </div>

      {showInput && !isConnected && (
        <div className="ml-11 space-y-2">
          <p className="text-xs text-muted-foreground">
            To find your Discord user ID: open Discord {">"} Settings {">"} Advanced {">"} enable Developer Mode.
            Then right-click your username {">"} Copy User ID.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter your Discord user ID"
              value={discordIdInput}
              onChange={(e) => setDiscordIdInput(e.target.value)}
              className="text-sm h-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConnect();
              }}
            />
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={isConnecting || !discordIdInput.trim()}
              className="h-8"
            >
              {isConnecting ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
