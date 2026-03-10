import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { profileService } from "@/features/profile/services/profile.service";

export function useProfile() {
  const { user, checkAuth } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateName = async (name: string) => {
    setIsUpdating(true);
    try {
      await profileService.updateName(name);
      await checkAuth();
      toast.success("Profile updated", {
        description: `Your name has been changed to "${name}".`,
      });
    } catch (err) {
      console.error("Error updating name:", err);
      toast.error("Couldn't update your name", {
        description: "Something went wrong. Please try again.",
      });
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateEmail = async (email: string, password: string) => {
    setIsUpdating(true);
    try {
      await profileService.updateEmail(email, password);
      await checkAuth();
      toast.success("Email updated", {
        description: `Your email has been changed to "${email}".`,
      });
    } catch (err) {
      console.error("Error updating email:", err);
      toast.error("Couldn't update email", {
        description: "Please verify your password is correct.",
      });
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePassword = async (newPassword: string, oldPassword: string) => {
    setIsUpdating(true);
    try {
      await profileService.updatePassword(newPassword, oldPassword);
      toast.success("Password changed", {
        description: "Your account is now using the new password.",
      });
    } catch (err) {
      console.error("Error updating password:", err);
      toast.error("Couldn't update password", {
        description: "Please verify your current password is correct.",
      });
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    user,
    isUpdating,
    updateName,
    updateEmail,
    updatePassword,
  };
}
