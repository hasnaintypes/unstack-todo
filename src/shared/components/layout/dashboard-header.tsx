"use client";

import { useState, useEffect } from "react";
import { User, LogOut, Settings, Search } from "lucide-react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { storageService } from "@/shared/services/storage.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { CommandPalette } from "@/shared/components/command-palette";

const PAGE_TITLES: Record<string, string> = {
  "/inbox": "Inbox",
  "/today": "Today",
  "/upcoming": "Upcoming",
  "/completed": "Completed",
  "/trash": "Trash",
  "/calendar": "Calendar",
  "/profile": "Profile",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/projects/")) return "Project";
  if (pathname.startsWith("/tasks/")) return "Task";
  return "";
}

interface DashboardHeaderProps {
  searchOpen?: boolean;
  onSearchOpenChange?: (open: boolean) => void;
}

export function DashboardHeader({ searchOpen, onSearchOpenChange }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = getPageTitle(location.pathname);

  const goToProfile = () => {
    navigate({ to: "/profile" });
  };

  const goToSettings = () => {
    navigate({ to: "/settings" });
  };

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarFileId = (user?.prefs as Record<string, string> | undefined)?.avatarFileId;

  useEffect(() => {
    if (avatarFileId) {
      setAvatarUrl(storageService.getFileDownloadUrl(avatarFileId).toString());
    } else {
      setAvatarUrl(null);
    }
  }, [avatarFileId]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
      {/* Left: Sidebar trigger + page title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-2" />
        {pageTitle && (
          <>
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-sm font-semibold">{pageTitle}</h1>
          </>
        )}
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <button
          onClick={() => onSearchOpenChange?.(true)}
          className="relative flex h-9 w-full max-w-md items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <div className="flex items-center gap-2">
            <Search className="size-4" />
            <span>Search tasks, projects...</span>
          </div>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">&#x2318;</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Avatar */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full outline-none transition-transform active:scale-95">
              <Avatar className="size-9 border border-border transition-colors hover:border-primary/50">
                <AvatarImage
                  src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60" sideOffset={8}>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">{user?.name || "Member"}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || "member@tasky.ai"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={goToProfile}>
              <User className="mr-2 size-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={goToSettings}>
              <Settings className="mr-2 size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
            >
              <LogOut className="mr-2 size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Command Palette */}
      <CommandPalette open={searchOpen ?? false} onOpenChange={onSearchOpenChange ?? (() => {})} />
    </header>
  );
}
