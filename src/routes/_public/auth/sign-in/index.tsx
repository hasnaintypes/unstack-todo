import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthForm } from "@/features/auth/components/auth-form";
import { logo } from "@/assets";

export const Route = createFileRoute("/_public/auth/sign-in/")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="bg-background flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
      <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
        <img src={logo} alt="Unstack Logo" className="size-7 object-contain" />
        <span className="font-bold tracking-tight text-lg">Unstack</span>
      </Link>
      <div className="w-full max-w-sm">
        <AuthForm type="sign-in" />
      </div>
    </div>
  );
}
