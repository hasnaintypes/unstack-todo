import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signUpSchema } from "@/shared/lib/validation";
import type { z } from "zod";
import { PasswordStrengthMeter } from "./password-strength-meter";

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

interface AuthFormProps extends React.ComponentProps<"div"> {
  type: "sign-in" | "sign-up";
}

export function AuthForm({ className, type, ...props }: AuthFormProps) {
  const { signIn, signUp, loginWithGoogle, loginWithDiscord } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const isSignIn = type === "sign-in";

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const form = isSignIn ? signInForm : signUpForm;
  const { handleSubmit, formState: { errors, isSubmitting } } = form;
  const register = (isSignIn ? signInForm : signUpForm).register as unknown as ReturnType<typeof useForm<FieldValues>>["register"];

  const onSubmit = async (data: SignInData | SignUpData) => {
    try {
      if (isSignIn) {
        const d = data as SignInData;
        await signIn(d.email, d.password);
        toast.success("Welcome back!");
      } else {
        const d = data as SignUpData;
        await signUp(d.email, d.password, d.name);
        toast.success("Account created successfully!");
      }
      navigate({ to: "/inbox" });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="gap-4">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h1 className="text-xl font-bold">{isSignIn ? "Welcome Back" : "Create an Account"}</h1>
            <FieldDescription>
              {isSignIn ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link to="/auth/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link to="/auth/sign-in" className="underline underline-offset-4">
                    Sign in
                  </Link>
                </>
              )}
            </FieldDescription>
          </div>
          {!isSignIn && (
            <Field className="gap-1.5">
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                {...register("name")}
                disabled={isSubmitting}
              />
              {!isSignIn && "name" in errors && errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </Field>
          )}
          <Field className="gap-1.5">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              autoComplete="email"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </Field>
          <Field className="gap-1.5">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                {...register("password")}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSubmitting}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4 cursor-pointer" />
                ) : (
                  <Eye className="size-4 cursor-pointer" />
                )}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
            {!isSignIn && <PasswordStrengthMeter password={signUpForm.watch("password")} />}
          </Field>
          <Field className="pt-1">
            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "Loading..." : isSignIn ? "Login" : "Register"}
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              type="button"
              className="h-9 cursor-pointer"
              onClick={loginWithDiscord}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                <path
                  d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"
                  fill="currentColor"
                />
              </svg>
              Discord
            </Button>
            <Button
              variant="outline"
              type="button"
              className="h-9 cursor-pointer"
              onClick={loginWithGoogle}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="text-center text-[11px] leading-tight">
        By clicking continue, you agree to our{" "}
        <Link to="/terms" className="underline underline-offset-4">
          Terms
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="underline underline-offset-4">
          Privacy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
