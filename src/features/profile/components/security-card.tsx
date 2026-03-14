import { Lock } from "lucide-react";
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
import { useProfile } from "@/features/profile/hooks/use-profile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/shared/lib/validation";
import type { z } from "zod";

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export function SecurityCard() {
  const { isUpdating, updatePassword } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ChangePasswordData) => {
    try {
      await updatePassword(data.newPassword, data.currentPassword);
      reset();
    } catch {
      // error already toasted
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Security</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Ensure your account is using a long, random password to stay secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input
              id="oldPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              variant="secondary"
              type="submit"
              className="w-full md:w-auto px-8"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
