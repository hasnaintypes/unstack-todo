"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Inbox,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Trash2,
  Hash,
  CircleDot,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { logo } from "@/assets";
import { cn } from "@/shared/lib/utils";
import { useProjects } from "@/shared/hooks/use-projects";
import { useTasks } from "@/shared/hooks/use-tasks";
import { getColorClass } from "@/features/projects/utils/colors";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";

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
} from "@/shared/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { Link } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";

const MAX_VISIBLE_TASKS = 3;

export function AppSidebar() {
  const { state } = useSidebar();
  const { projects, updateProject, deleteProject, isLoading } = useProjects();
  const { tasks } = useTasks();
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const navigateTo = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const activeProjects = useMemo(() => projects.filter((p) => !p.isArchived), [projects]);
  const archivedProjects = useMemo(() => projects.filter((p) => p.isArchived), [projects]);

  const navItems = [
    { icon: Inbox, label: "Inbox", to: "/inbox" as const, badge: null as string | null },
    { icon: Calendar, label: "Today", to: "/today" as const, badge: null as string | null },
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

  const tasksByProject = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      if (task.project && task.status !== "completed") {
        if (!map[task.project]) {
          map[task.project] = [];
        }
        map[task.project].push(task);
      }
    }
    return map;
  }, [tasks]);

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleProjectCreated = (projectId: string, shouldGenerate: boolean) => {
    navigateTo({
      to: "/projects/$projectId",
      params: { projectId },
      search: shouldGenerate ? { generate: "true" } : {},
    });
  };

  const handleArchiveProject = async (projectId: string) => {
    try {
      await updateProject(projectId, { isArchived: true });
      toast.success("Project archived", {
        description: "You can find it in the Archived section.",
      });
    } catch (err) {
      console.error("Error archiving project:", err);
      toast.error("Failed to archive project");
    }
  };

  const handleUnarchiveProject = async (projectId: string) => {
    try {
      await updateProject(projectId, { isArchived: false });
      toast.success("Project restored", {
        description: "Project is now active again.",
      });
    } catch (err) {
      console.error("Error unarchiving project:", err);
      toast.error("Failed to restore project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Delete this project? Tasks won't be deleted.")) return;
    try {
      await deleteProject(projectId);
      toast.success("Project deleted", {
        description: "The project has been permanently removed.",
      });
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar/50 backdrop-blur-sm">
      <SidebarHeader
        className={cn(
          "flex flex-row items-center border-b",
          state === "expanded" ? "p-4 justify-between gap-2" : "p-2 justify-center"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            state === "expanded" ? "gap-3 px-1" : "justify-center"
          )}
        >
          <a href="/inbox" className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 p-1 shrink-0">
              <img src={logo} alt="UnStack Todo" className="size-full" />
            </div>
            {state === "expanded" && (
              <span className="text-lg font-bold tracking-tight">UnStack</span>
            )}
          </a>
        </div>
      </SidebarHeader>

      <SidebarContent
        className={cn("flex flex-col overflow-hidden", state === "expanded" ? "px-2" : "px-0")}
      >
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

        {/* Projects Section */}
        <SidebarGroup className="flex-1 flex flex-col min-h-0">
          {state === "expanded" ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Active Projects */}
              <Collapsible open={isProjectsExpanded} onOpenChange={setIsProjectsExpanded}>
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
                    onClick={() => setIsAddDialogOpen(true)}
                    className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    aria-label="Add project"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-1">
                      {isLoading ? (
                        <div className="space-y-2 px-2 py-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-8 rounded-md bg-muted animate-pulse"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </div>
                      ) : activeProjects.length === 0 ? (
                        <div className="flex flex-col items-center py-8 px-4 text-center">
                          <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                            <FolderOpen className="size-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            No projects yet
                          </p>
                          <p className="text-xs text-muted-foreground/70 mb-4">
                            Organize tasks into projects
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddDialogOpen(true)}
                            className="gap-1.5 text-xs"
                          >
                            <Plus className="size-3" />
                            Create project
                          </Button>
                        </div>
                      ) : (
                        <SidebarMenu className="gap-2">
                          {activeProjects.map((project) => {
                            const projectTasks = tasksByProject[project.name] || [];

                            return (
                              <Collapsible
                                key={project.id}
                                open={expandedProjects[project.id] ?? false}
                                onOpenChange={() => toggleProjectExpanded(project.id)}
                                className="group/collapsible"
                              >
                                <SidebarMenuItem className="group/project">
                                  <div className="flex items-center w-full">
                                    <CollapsibleTrigger asChild>
                                      <button
                                        className="flex size-6 items-center justify-center rounded-md hover:bg-accent shrink-0 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ChevronRight
                                          className={cn(
                                            "size-3.5 text-muted-foreground transition-transform",
                                            expandedProjects[project.id] && "rotate-90"
                                          )}
                                        />
                                      </button>
                                    </CollapsibleTrigger>
                                    <SidebarMenuButton
                                      asChild
                                      className="hover:bg-accent/50 px-2 cursor-pointer flex-1 justify-start"
                                    >
                                      <Link
                                        to="/projects/$projectId"
                                        params={{ projectId: project.id }}
                                      >
                                        <Hash
                                          className={cn(
                                            "size-4 shrink-0",
                                            getColorClass(project.color).replace("bg-", "text-")
                                          )}
                                        />
                                        <span className="flex-1 font-medium text-foreground/90 text-left truncate">
                                          {project.name}
                                        </span>
                                      </Link>
                                    </SidebarMenuButton>

                                    {/* Context menu */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          className="opacity-0 group-hover/project:opacity-100 transition-opacity flex size-6 items-center justify-center rounded-md hover:bg-accent shrink-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <MoreHorizontal className="size-3.5 text-muted-foreground" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem disabled>
                                          <Pencil className="size-3.5 mr-2" />
                                          Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleArchiveProject(project.id)}
                                        >
                                          <Archive className="size-3.5 mr-2" />
                                          Archive
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteProject(project.id)}
                                          className="text-destructive focus:text-destructive"
                                        >
                                          <Trash className="size-3.5 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  <CollapsibleContent>
                                    {projectTasks.length > 0 ? (
                                      <div className="relative mt-2 ml-5 py-1">
                                        <div className="absolute left-2 top-0 h-full w-px bg-border/50" />
                                        <SidebarMenu className="gap-2">
                                          {projectTasks.slice(0, MAX_VISIBLE_TASKS).map((task) => (
                                            <SidebarMenuItem
                                              key={task.id}
                                              className="relative z-10 pl-3 cursor-pointer"
                                            >
                                              <SidebarMenuButton
                                                asChild
                                                className="group h-7 px-0 hover:bg-transparent justify-start"
                                              >
                                                <Link
                                                  to="/projects/$projectId"
                                                  params={{ projectId: project.id }}
                                                  className="flex items-center w-full"
                                                >
                                                  <div className="flex size-4 items-center justify-center rounded-full bg-background ring-2 ring-background shrink-0">
                                                    <CircleDot
                                                      className={cn(
                                                        "size-3.5",
                                                        task.status === "in-progress"
                                                          ? "text-primary animate-pulse"
                                                          : task.status === "completed"
                                                            ? "text-green-500"
                                                            : "text-muted-foreground/30"
                                                      )}
                                                    />
                                                  </div>
                                                  <span
                                                    className={cn(
                                                      "ml-2 text-sm transition-colors cursor-pointer truncate",
                                                      task.status === "in-progress"
                                                        ? "text-foreground font-medium"
                                                        : task.status === "completed"
                                                          ? "text-muted-foreground line-through"
                                                          : "text-muted-foreground group-hover:text-foreground"
                                                    )}
                                                  >
                                                    {task.title}
                                                  </span>
                                                </Link>
                                              </SidebarMenuButton>
                                            </SidebarMenuItem>
                                          ))}
                                          {projectTasks.length > MAX_VISIBLE_TASKS && (
                                            <SidebarMenuItem className="pl-3">
                                              <SidebarMenuButton
                                                asChild
                                                className="h-7 px-0 hover:bg-transparent"
                                              >
                                                <Link
                                                  to="/projects/$projectId"
                                                  params={{ projectId: project.id }}
                                                  className="ml-6 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                  +{projectTasks.length - MAX_VISIBLE_TASKS} more
                                                </Link>
                                              </SidebarMenuButton>
                                            </SidebarMenuItem>
                                          )}
                                        </SidebarMenu>
                                      </div>
                                    ) : (
                                      <p className="ml-8 mt-1 text-xs text-muted-foreground/50 py-1">
                                        No active tasks
                                      </p>
                                    )}
                                  </CollapsibleContent>
                                </SidebarMenuItem>
                              </Collapsible>
                            );
                          })}
                        </SidebarMenu>
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>

              {/* Archived Projects */}
              {archivedProjects.length > 0 && (
                <>
                  <SidebarSeparator className="mx-0 my-2" />
                  <Collapsible open={isArchivedExpanded} onOpenChange={setIsArchivedExpanded}>
                    <div className="flex items-center px-2 py-1.5 shrink-0">
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-1.5 cursor-pointer hover:bg-accent/50 rounded-md px-0 py-1 transition-colors flex-1">
                          <ChevronDown
                            className={cn(
                              "size-3 text-muted-foreground transition-transform",
                              !isArchivedExpanded && "-rotate-90"
                            )}
                          />
                          <Archive className="size-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-semibold">
                            Archived
                          </span>
                          <span className="ml-auto text-[10px] font-medium text-muted-foreground tabular-nums">
                            {archivedProjects.length}
                          </span>
                        </button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                          {archivedProjects.map((project) => (
                            <SidebarMenuItem key={project.id} className="group/project">
                              <div className="flex items-center w-full">
                                <SidebarMenuButton
                                  asChild
                                  className="hover:bg-accent/50 px-2 cursor-pointer flex-1 justify-start opacity-60"
                                >
                                  <Link
                                    to="/projects/$projectId"
                                    params={{ projectId: project.id }}
                                    className="flex items-center gap-2 w-full"
                                  >
                                    <Hash
                                      className={cn(
                                        "size-3.5 shrink-0",
                                        getColorClass(project.color).replace("bg-", "text-")
                                      )}
                                    />
                                    <span className="flex-1 font-medium text-foreground/70 truncate">
                                      {project.name}
                                    </span>
                                  </Link>
                                </SidebarMenuButton>

                                {/* Context menu */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="opacity-0 group-hover/project:opacity-100 transition-opacity flex size-6 items-center justify-center rounded-md hover:bg-accent shrink-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="size-3.5 text-muted-foreground" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                      onClick={() => handleUnarchiveProject(project.id)}
                                    >
                                      <ArchiveRestore className="size-3.5 mr-2" />
                                      Unarchive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteProject(project.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash className="size-3.5 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              )}
            </div>
          ) : (
            /* Collapsed sidebar - show centered project icons */
            <SidebarMenu className="items-center gap-1 px-1">
              {activeProjects.map((project) => (
                <SidebarMenuItem key={project.id} className="w-full">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild className="justify-center">
                          <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                            <Hash
                              className={cn(
                                "size-4",
                                getColorClass(project.color).replace("bg-", "text-")
                              )}
                            />
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-semibold">{project.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(tasksByProject[project.name] || []).length} tasks
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              ))}
              {activeProjects.length === 0 && !isLoading && (
                <SidebarMenuItem className="w-full">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          className="justify-center"
                          onClick={() => setIsAddDialogOpen(true)}
                        >
                          <Plus className="size-4 text-muted-foreground" />
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Create project</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>

      <CreateProjectDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onCreated={handleProjectCreated}
      />
    </Sidebar>
  );
}
