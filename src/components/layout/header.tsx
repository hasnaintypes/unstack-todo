import { Link, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  User,
  Settings,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { logo } from "@/assets";

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate({ to: "/auth/sign-in" });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

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
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex items-center justify-center">
              <img src={logo} alt="Unstack Logo" className="size-6 object-contain" />
            </div>
            <span className="hidden font-bold tracking-tight sm:inline-block text-lg">
              Unstack
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                to="/inbox"
                activeProps={activeLinkProps}
                inactiveProps={inactiveLinkProps}
              >
                Home
              </Link>
              <Link
                to="/about"
                activeProps={activeLinkProps}
                inactiveProps={inactiveLinkProps}
              >
                About
              </Link>
            </nav>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ring-offset-background transition-colors hover:bg-muted"
                >
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  <User className="mr-2 size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                  <Settings className="mr-2 size-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                >
                  <LogOut className="mr-2 size-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
