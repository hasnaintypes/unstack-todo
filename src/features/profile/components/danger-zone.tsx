import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { authService } from "@/features/auth/services/auth.service";
import { logger } from "@/shared/lib/logger";

export function DangerZone() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user?.$id) return;
    setIsDeleting(true);
    try {
      await authService.deleteAccount(user.$id);
      await logout();
      navigate({ to: "/auth/sign-in" });
      toast.success("Account deleted", {
        description: "Your account and all data have been removed.",
      });
    } catch (err) {
      logger.error("Account deletion error", { error: err });
      toast.error("Failed to delete account", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pt-2">
      <Separator className="mb-6" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
        <div>
          <h4 className="text-sm font-semibold text-destructive">Delete Account</h4>
          <p className="text-xs text-muted-foreground">
            Permanently remove your account and all of your data.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              {isDeleting && <Loader2 className="size-4 mr-2 animate-spin" />}
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account, all tasks,
                projects, categories, and preferences.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
