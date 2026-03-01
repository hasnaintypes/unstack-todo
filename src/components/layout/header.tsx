import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

import { logo } from "@/assets";

export function Header() {
  const { user, isLoading } = useAuth();

  // Define active link styles once
  const activeLinkProps = {
    className: "text-foreground font-semibold",
  };

  const inactiveLinkProps = {
    className: "text-muted-foreground transition-colors hover:text-foreground",
  };

  return (
    <div className="sticky top-4 z-50 flex justify-center w-full px-4 pointer-events-none">
      <header className="pointer-events-auto w-full max-w-5xl h-14 rounded-full border bg-background/60 backdrop-blur-lg shadow-sm px-6 flex items-center justify-between transition-all duration-300">
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex items-center justify-center">
              <img src={logo} alt="Unstack Logo" className="size-6 object-contain" />
            </div>
            <span className="hidden font-bold tracking-tight sm:inline-block text-lg">Unstack</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" activeProps={activeLinkProps} inactiveProps={inactiveLinkProps}>
              Home
            </Link>
            <Link to="/about" activeProps={activeLinkProps} inactiveProps={inactiveLinkProps}>
              About
            </Link>
          </nav>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <>
              <Button variant="default" size="sm" asChild className="rounded-full px-5">
                <Link to="/inbox">Go to Inbox</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-sm font-medium">
                <Link to="/auth/sign-in">Sign in</Link>
              </Button>
              <Button variant="default" size="sm" asChild className="rounded-full px-5">
                <Link to="/auth/sign-up">Start for free</Link>
              </Button>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
