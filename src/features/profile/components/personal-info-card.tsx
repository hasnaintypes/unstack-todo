import { useState, useRef, useEffect } from "react";
import { User, Mail, Camera, Loader2 } from "lucide-react";
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
import { storageService } from "@/shared/services/storage.service";
import { logger } from "@/shared/lib/logger";
import { account } from "@/config/appwrite";
import { toast } from "sonner";

export function PersonalInfoCard() {
  const { user, isUpdating, updateName } = useProfile();

  const nameParts = (user?.name || "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing avatar from account prefs on mount
  const avatarFileId = (user?.prefs as Record<string, string> | undefined)?.avatarFileId;
  useEffect(() => {
    if (avatarFileId) {
      setAvatarUrl(storageService.getFileDownloadUrl(avatarFileId).toString());
    }
  }, [avatarFileId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, and GIF images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      // Delete old avatar file if it exists
      const currentAvatarId = (user?.prefs as Record<string, string> | undefined)?.avatarFileId;
      if (currentAvatarId) {
        try { await storageService.deleteTaskAttachment(currentAvatarId); } catch { /* old file may be gone */ }
      }
      const result = await storageService.uploadTaskAttachment(file);
      const url = storageService.getFileDownloadUrl(result.$id);
      await account.updatePrefs({ avatarFileId: result.$id });
      setAvatarUrl(url.toString());
      toast.success("Profile picture updated");
    } catch (err) {
      logger.error("Avatar upload error", { error: err });
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

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
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {initials}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {isUploadingAvatar ? <Loader2 className="text-white w-5 h-5 animate-spin" /> : <Camera className="text-white w-5 h-5" />}
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
