import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth/auth-form";

export const Route = createFileRoute("/_public/auth/sign-up/")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="bg-background flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
      <div className="w-full max-w-sm">
        <AuthForm type="sign-up" />
      </div>
    </div>
  );
}
