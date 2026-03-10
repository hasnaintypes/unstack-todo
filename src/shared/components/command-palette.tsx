import { useMemo, useState } from "react";
import {
  Plus,
  Inbox,
  Calendar,
  CalendarDays,
  CheckCircle2,
  User,
  Settings,
  FolderKanban,
  Flag,
  Search,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { useTasks } from "@/app/providers/task-provider";
import { useProjects } from "@/app/providers/project-provider";
import { getPriorityConfig } from "@/features/tasks/utils/task-helpers";
import { cn } from "@/shared/lib/utils";
import { PROJECT_COLOR_MAP } from "@/features/projects/utils/colors";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask?: () => void;
}

export function CommandPalette({ open, onOpenChange, onCreateTask }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { tasks, setSelectedTask } = useTasks();
  const { projects } = useProjects();
  const [search, setSearch] = useState("");

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status !== "completed"),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return activeTasks.slice(0, 8);
    const q = search.toLowerCase();
    return activeTasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [activeTasks, search]);

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects.slice(0, 5);
    const q = search.toLowerCase();
    return projects
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [projects, search]);

  const handleSelect = (action: () => void) => {
    action();
    onOpenChange(false);
    setSearch("");
  };

  return (
    <CommandDialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setSearch(""); }}>
      <CommandInput
        placeholder="Search tasks, projects, or type a command..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <Search className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No results found</p>
          </div>
        </CommandEmpty>

        {/* Tasks */}
        {filteredTasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {filteredTasks.map((task) => {
              const priorityConfig = getPriorityConfig(task.priority);
              return (
                <CommandItem
                  key={task.id}
                  value={`task-${task.id}-${task.title}`}
                  onSelect={() => handleSelect(() => setSelectedTask(task))}
                  className="flex items-center gap-3"
                >
                  <div
                    className={cn(
                      "size-2 rounded-full shrink-0",
                      task.status === "in-progress" ? "bg-blue-500" : "bg-muted-foreground/30"
                    )}
                  />
                  <span className="flex-1 truncate">{task.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.project && task.project !== "inbox" && (
                      <span className="text-xs text-muted-foreground">{task.project}</span>
                    )}
                    <Flag className={cn("size-3", priorityConfig.iconClass)} />
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Projects */}
        {filteredProjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {filteredProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`project-${project.id}-${project.name}`}
                  onSelect={() =>
                    handleSelect(() => navigate({ to: "/projects/$projectId", params: { projectId: project.id } }))
                  }
                  className="flex items-center gap-3"
                >
                  <div className={cn("size-3 rounded-full shrink-0", PROJECT_COLOR_MAP[project.color] || "bg-blue-500")} />
                  <span className="flex-1 truncate">{project.name}</span>
                  <FolderKanban className="size-3.5 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Actions */}
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => handleSelect(() => onCreateTask?.())}
            value="create-new-task"
          >
            <Plus className="mr-2 size-4" />
            <span>Create New Task</span>
          </CommandItem>
        </CommandGroup>

        {/* Navigation */}
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => handleSelect(() => navigate({ to: "/inbox" }))}
            value="go-to-inbox"
          >
            <Inbox className="mr-2 size-4" />
            <span>Go to Inbox</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate({ to: "/today" }))}
            value="go-to-today"
          >
            <Calendar className="mr-2 size-4" />
            <span>Today</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate({ to: "/upcoming" }))}
            value="go-to-upcoming"
          >
            <CalendarDays className="mr-2 size-4" />
            <span>Upcoming</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate({ to: "/completed" }))}
            value="go-to-completed"
          >
            <CheckCircle2 className="mr-2 size-4" />
            <span>Completed</span>
          </CommandItem>
        </CommandGroup>

        {/* Settings */}
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => handleSelect(() => navigate({ to: "/profile" }))}
            value="manage-profile"
          >
            <User className="mr-2 size-4" />
            <span>Manage Profile</span>
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate({ to: "/settings" }))}
            value="app-settings"
          >
            <Settings className="mr-2 size-4" />
            <span>App Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
