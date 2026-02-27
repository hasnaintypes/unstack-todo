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
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

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
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center">
        <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground hover:bg-muted" />
      </div>

      <div className="flex shrink-0 items-center justify-center">
        {/* 2. Search Trigger Button (Replaces raw input) */}
        <button
          onClick={() => setOpen(true)}
          className="relative flex h-9 w-[400px] items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
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

      <div className="flex flex-1 items-center justify-end gap-4">
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
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
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
                console.log("Dashboard");
                setOpen(false);
              }}
            >
              <LayoutDashboard className="mr-2 size-4" />
              <span>Go to Dashboard</span>
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
                console.log("Profile");
                setOpen(false);
              }}
            >
              <User className="mr-2 size-4" />
              <span>Manage Profile</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                console.log("Settings");
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
