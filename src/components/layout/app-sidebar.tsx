"use client";

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
} from "lucide-react";
import { logo } from "@/assets";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@tanstack/react-router";

export function AppSidebar() {
  const navItems = [
    { icon: Inbox, label: "Inbox", to: "/dashboard", badge: null },
    { icon: Calendar, label: "Today", to: "/dashboard", badge: "1" },
    { icon: CalendarDays, label: "Upcoming", to: "/dashboard", badge: null },
    { icon: Calendar, label: "Calendar", to: "/dashboard", badge: null },
    { icon: CheckCircle2, label: "Completed", to: "/dashboard", badge: null },
    { icon: Trash2, label: "Trash", to: "/dashboard", badge: null },
  ];

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
          <span className="text-lg font-bold tracking-tight">UnStack</span>
        </div>
      </SidebarHeader>

      {/* Added flex-col and overflow-hidden to prevent whole-sidebar scrolling */}
      <SidebarContent className="px-2 flex flex-col overflow-hidden">
        <SidebarGroup className="shrink-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-primary hover:text-primary transition-colors">
                <Plus className="size-4" />
                <span className="font-medium">Add task</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="shrink-0">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild>
                  <Link to={item.to as any}>
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] font-medium text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-0 my-2" />

        {/* This group now takes up the remaining space */}
        <SidebarGroup className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2 py-2 shrink-0">
            <div className="flex items-center gap-2">
              <ChevronDown className="size-3 text-muted-foreground" />
              <SidebarGroupLabel className="p-0 text-foreground font-semibold">
                Projects
              </SidebarGroupLabel>
            </div>
            <SidebarGroupAction>
              <Plus className="size-3" />
            </SidebarGroupAction>
          </div>

          {/* ScrollArea wraps only the project list */}
          <ScrollArea className="flex-1 pr-3">
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {projectGroups.map((group) => (
                  <Collapsible
                    key={group.name}
                    defaultOpen
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="hover:bg-transparent px-2 cursor-pointer">
                          <Hash className="size-4 text-muted-foreground mr-1" />
                          <span className="flex-1 font-semibold text-foreground/80">
                            {group.name}
                          </span>
                          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="relative mt-2 ml-7 py-1">
                          <div className="absolute left-2 top-0 h-full w-px bg-border/60 cursor-pointer" />
                          <SidebarMenu className="gap-3">
                            {group.tasks.map((task) => (
                              <SidebarMenuItem
                                key={task.name}
                                className="relative z-10 pl-2 cursor-pointer"
                              >
                                <SidebarMenuButton className="group h-7 px-0 hover:bg-transparent">
                                  <div className="flex size-4 items-center justify-center rounded-full bg-background ring-2 ring-background">
                                    <CircleDot
                                      className={cn(
                                        "size-3.5",
                                        task.status === "in-progress"
                                          ? "text-primary animate-pulse"
                                          : "text-muted-foreground/30",
                                      )}
                                    />
                                  </div>
                                  <span
                                    className={cn(
                                      "ml-2 text-sm transition-colors cursor-pointer",
                                      task.status === "in-progress"
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground group-hover:text-foreground",
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
          </ScrollArea>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
