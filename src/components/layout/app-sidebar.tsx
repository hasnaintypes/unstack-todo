"use client";

import { useState } from "react";
import {
  Plus,
  Inbox,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Trash2,
  CircleDot,
  Hash,
  Folder,
} from "lucide-react";
import { logo } from "@/assets";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AppSidebar() {
  const { state } = useSidebar();
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(["Work – Sprint Tasks", "Side Project – Unstack Todo"])
  );

  const navItems = [
    { icon: Inbox, label: "Inbox", to: "/inbox" as const, badge: null as string | null },
    { icon: Calendar, label: "Today", to: "/today" as const, badge: "1" as string | null },
    {
      icon: CalendarDays,
      label: "Upcoming",
      to: "/upcoming" as const,
      badge: null as string | null,
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      to: "/completed" as const,
      badge: null as string | null,
    },
    { icon: Trash2, label: "Trash", to: "/trash" as const, badge: null as string | null },
  ];

  const toggleProject = (projectName: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  };

  const projectGroups = [
    {
      name: "Work – Sprint Tasks",
      tasks: [
        { name: "Fix login validation bug", status: "in-progress" },
        { name: "Implement Appwrite auth flow", status: "todo" },
        { name: "Refactor API service layer", status: "todo" },
        { name: "Write unit tests for auth", status: "todo" },
      ],
    },
    {
      name: "Trip Plan 2024",
      tasks: [
        { name: "Book flight tickets", status: "in-progress" },
        { name: "Reserve hotel", status: "todo" },
        { name: "Create travel itinerary", status: "todo" },
        { name: "Apply for travel insurance", status: "todo" },
      ],
    },
    {
      name: "Personal Development",
      tasks: [
        { name: "Learn Tailwind advanced patterns", status: "in-progress" },
        { name: "Build Vite + Appwrite demo", status: "todo" },
        { name: "Read about system design basics", status: "todo" },
      ],
    },
    {
      name: "Health & Routine",
      tasks: [
        { name: "Morning workout", status: "done" },
        { name: "Drink 2L water", status: "in-progress" },
        { name: "Sleep before 11 PM", status: "todo" },
      ],
    },
    {
      name: "Side Project – Unstack Todo",
      tasks: [
        { name: "Set up Tailwind + shadcn/ui", status: "done" },
        { name: "Design task board UI", status: "in-progress" },
        { name: "Persist tasks with Appwrite DB", status: "todo" },
        { name: "Add drag-and-drop support", status: "todo" },
      ],
    },
  ];

  return (
    <Sidebar className="border-r bg-sidebar/50 backdrop-blur-sm">
      <SidebarHeader className="p-4 flex flex-row items-center justify-between gap-2 border-b">
        <div className="flex items-center gap-3 px-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 p-1">
            <img src={logo} alt="UnStack Todo" className="size-full" />
          </div>
          {state === "expanded" && (
            <span className="text-lg font-bold tracking-tight">UnStack</span>
          )}
        </div>
      </SidebarHeader>

      {/* Added flex-col and overflow-hidden to prevent whole-sidebar scrolling */}
      <SidebarContent className="px-2 flex flex-col overflow-hidden">
        <SidebarGroup className="shrink-0">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                        <Link to={item.to}>
                          <item.icon className="size-4" />
                          {state === "expanded" && <span>{item.label}</span>}
                          {state === "expanded" && item.badge && (
                            <span className="ml-auto text-[10px] font-medium text-muted-foreground">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    {state === "collapsed" && (
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                        {item.badge && <span className="ml-2 text-xs">({item.badge})</span>}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-0 my-2" />

        {/* This group now takes up the remaining space */}
        <SidebarGroup className="flex-1 flex flex-col min-h-0">
          {state === "expanded" ? (
            <Collapsible
              open={isProjectsExpanded}
              onOpenChange={setIsProjectsExpanded}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex items-center justify-between px-2 py-1.5 shrink-0">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1.5 cursor-pointer hover:bg-accent/50 rounded-md px-0 py-1 transition-colors flex-1">
                    <ChevronDown
                      className={cn(
                        "size-3 text-muted-foreground transition-transform",
                        !isProjectsExpanded && "-rotate-90"
                      )}
                    />
                    <span className="text-sm text-foreground font-semibold">Projects</span>
                  </button>
                </CollapsibleTrigger>
                <button
                  type="button"
                  className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  aria-label="Add project"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              {/* ScrollArea wraps only the project list - scrollbar hidden */}
              <CollapsibleContent className="flex-1 min-h-0">
                <div className="h-full overflow-auto pr-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-2">
                      {projectGroups.map((group) => (
                        <Collapsible
                          key={group.name}
                          open={expandedProjects.has(group.name)}
                          onOpenChange={() => toggleProject(group.name)}
                          className="group/collapsible"
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="hover:bg-accent/50 px-2 cursor-pointer w-full justify-start">
                                <Hash className="size-4 text-muted-foreground" />
                                <span className="flex-1 font-medium text-foreground/90 text-left">
                                  {group.name}
                                </span>
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="relative mt-2 ml-5 py-1">
                                <div className="absolute left-2 top-0 h-full w-px bg-border/50" />
                                <SidebarMenu className="gap-2">
                                  {group.tasks.map((task) => (
                                    <SidebarMenuItem
                                      key={task.name}
                                      className="relative z-10 pl-3 cursor-pointer"
                                    >
                                      <SidebarMenuButton className="group h-7 px-0 hover:bg-transparent justify-start">
                                        <div className="flex size-4 items-center justify-center rounded-full bg-background ring-2 ring-background shrink-0">
                                          <CircleDot
                                            className={cn(
                                              "size-3.5",
                                              task.status === "in-progress"
                                                ? "text-primary animate-pulse"
                                                : task.status === "done"
                                                  ? "text-green-500"
                                                  : "text-muted-foreground/30"
                                            )}
                                          />
                                        </div>
                                        <span
                                          className={cn(
                                            "ml-2 text-sm transition-colors cursor-pointer",
                                            task.status === "in-progress"
                                              ? "text-foreground font-medium"
                                              : task.status === "done"
                                                ? "text-muted-foreground line-through"
                                                : "text-muted-foreground group-hover:text-foreground"
                                          )}
                                        >
                                          {task.name}
                                        </span>
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                  ))}
                                </SidebarMenu>
                              </div>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            // Collapsed sidebar - show just folder icon with tooltip
            <div className="flex flex-col gap-1">
              {projectGroups.map((group) => (
                <TooltipProvider key={group.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        className="w-full justify-center"
                        onClick={() => toggleProject(group.name)}
                      >
                        <Folder className="size-4 text-muted-foreground" />
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="font-semibold">{group.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {group.tasks.length} tasks
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
