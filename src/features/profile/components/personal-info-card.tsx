import { useState } from "react";
import { User, Mail, Camera } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { useProfile } from "@/features/profile/hooks/use-profile";

export function PersonalInfoCard() {
  const { user, isUpdating, updateName } = useProfile();

  const nameParts = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleSave = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) return;
    try {
      await updateName(fullName);
    } catch {
      // error already toasted
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Update your photo and personal details here.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Avatar Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {initials}
            </div>
            <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="text-white w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium">Profile Picture</h4>
            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
          </div>
        </div>

        <Separator />

        {/* Form Fields */}
        <div className="grid gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              Email Address
            </Label>
            <Input id="email" type="email" value={user?.email || ""} disabled />
            <p className="text-xs text-muted-foreground">
              Email changes require password verification. Contact support to update.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            size="lg"
            className="w-full md:w-auto px-8"
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
