"use client";

import * as React from "react";
import {
  User,
  LogOut,
  Settings,
  Search,
  Calendar,
  Plus,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  const goToProfile = () => {
    window.location.assign("/profile");
  };

  const goToSettings = () => {
    window.location.assign("/settings");
  };

  // 1. Keyboard shortcut listener (Cmd+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="grid h-16 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex justify-center">
        <button
          onClick={() => setOpen(true)}
          className="relative flex h-9 w-full max-w-115 items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <div className="flex items-center gap-2">
            <Search className="size-4" />
            <span>Search tasks, projects...</span>
          </div>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center justify-end gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full outline-none transition-transform active:scale-95">
              <Avatar className="size-9 border border-border transition-colors hover:border-primary/50">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || `User`}`}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60" sideOffset={8}>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">
                {user?.name || "Member"}
              </p>
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

      {/* 3. Command Dialog Palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem
              onSelect={() => {
                console.log("New Task");
                setOpen(false);
              }}
            >
              <Plus className="mr-2 size-4" />
              <span>Create New Task</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                console.log("Inbox");
                setOpen(false);
              }}
            >
              <LayoutDashboard className="mr-2 size-4" />
              <span>Go to Inbox</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                console.log("Calendar");
                setOpen(false);
              }}
            >
              <Calendar className="mr-2 size-4" />
              <span>View Calendar</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => {
                goToProfile();
                setOpen(false);
              }}
            >
              <User className="mr-2 size-4" />
              <span>Manage Profile</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                goToSettings();
                setOpen(false);
              }}
            >
              <Settings className="mr-2 size-4" />
              <span>App Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
