import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { useProjects } from "@/shared/hooks/use-projects";
import { useTasks } from "@/shared/hooks/use-tasks";
import { TaskItem } from "@/features/tasks/components/task-item";
import { TaskAddDialog } from "@/features/tasks/components/task-add-dialog";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { KanbanBoard } from "@/features/tasks/components/kanban";
import { projectTaskEmptyState } from "@/assets";
import { ProjectHeader } from "@/features/projects/components/project-header";
import { ViewToggle, type ViewMode } from "@/shared/components/view-toggle";
import { ProjectStatCards, ProjectCharts } from "@/features/projects/components/project-stats";
import { ProjectNotFound } from "@/features/projects/components/project-not-found";
import { DeleteProjectDialog } from "@/features/projects/components/delete-project-dialog";
import { AiTaskGenerator } from "@/features/projects/components/ai-task-generator";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import type { TaskSuggestion } from "@/shared/services/ai.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/projects/$projectId")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject } = useProjects();
  const { tasks, addTask, addTasksBatch, updateTask, toggleTaskComplete, moveToTrash, setSelectedTask } =
    useTasks();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const project = projects.find((p) => p.id === projectId);

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.project === project?.name),
    [tasks, project?.name]
  );

  const listSections = useMemo(
    () => [
      {
        key: "todo",
        title: "To Do",
        hint: "Planned and ready to start",
        badgeClass: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
        tasks: projectTasks.filter((task) => task.status === "todo"),
      },
      {
        key: "in-progress",
        title: "In Progress",
        hint: "Actively being worked on",
        badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
        tasks: projectTasks.filter((task) => task.status === "in-progress"),
      },
      {
        key: "completed",
        title: "Completed",
        hint: "Finished tasks",
        badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
        tasks: projectTasks.filter((task) => task.status === "completed"),
      },
    ],
    [projectTasks]
  );

  const handleAiGenerate = useCallback(() => {
    setShowAiGenerator(true);
  }, []);

  const handleAiAddTasks = useCallback(async (suggestions: TaskSuggestion[]) => {
    if (!project) return;
    const taskDataList = suggestions.map((s) => ({
      title: s.title,
      description: s.description + " [AI Generated]",
      dueDate: "",
      priority: s.priority,
      project: project.name,
      status: "todo" as const,
    }));
    await addTasksBatch(taskDataList);
    toast.success(`${suggestions.length} task${suggestions.length !== 1 ? "s" : ""} added`, {
      description: `AI tasks added to "${project.name}"`,
    });
  }, [addTasksBatch, project]);


  const handleAddTask = async (taskData: Partial<CalendarTask>) => {
    await addTask({
      ...taskData,
      project: project?.name,
    } as Omit<CalendarTask, "id">);
  };

  const handleEdit = useCallback((taskId: string, updates: Partial<CalendarTask>) => {
    updateTask(taskId, updates);
  }, [updateTask]);

  const handleDeleteProject = useCallback(async () => {
    if (!project) return;
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      navigate({ to: "/inbox" });
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }, [project, deleteProject, navigate]);

  const handleUpdateProject = useCallback(
    async (data: { name?: string; description?: string; color?: string }) => {
      if (!project) return;
      try {
        await updateProject(project.id, data);
        toast.success("Project updated");
      } catch (err) {
        console.error("Error updating project:", err);
        toast.error("Failed to update project");
      }
    },
    [project, updateProject]
  );

  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        onAiGenerate={handleAiGenerate}
        isAiGenerating={showAiGenerator}
        onAddTask={() => setIsAddDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onUpdate={handleUpdateProject}
      />

      <Dialog open={showAiGenerator} onOpenChange={setShowAiGenerator}>
        <DialogContent className="p-0 gap-0 max-w-lg">
          {project && (
            <AiTaskGenerator
              project={project}
              onClose={() => setShowAiGenerator(false)}
              onAddTasks={handleAiAddTasks}
              autoGenerate
            />
          )}
        </DialogContent>
      </Dialog>

      <ProjectStatCards tasks={projectTasks} />
      <ProjectCharts tasks={projectTasks} />

      {/* Tasks */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm backdrop-blur sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Tasks</h2>
            {projectTasks.length > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {projectTasks.length} task{projectTasks.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {projectTasks.length > 0 && (
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          )}
        </div>

        {projectTasks.length === 0 ? (
          <TaskEmptyState
            image={projectTaskEmptyState}
            imageAlt="No tasks in project"
            title=""
            heading=""
            description=""
            showAddButton={false}
          />
        ) : viewMode === "kanban" ? (
          <KanbanBoard
            tasks={projectTasks}
            onUpdateTask={(id, updates) => updateTask(id, updates)}
            onTaskClick={setSelectedTask}
            onToggleComplete={toggleTaskComplete}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-background/55 shadow-inner">
            <div className="border-b bg-muted/25 px-4 py-2.5 text-xs font-medium text-muted-foreground">
              Click a task to open full details. Inline title edit is available from each row.
            </div>
            <div className="space-y-4 p-3">
              {listSections.map((section) => (
                <section key={section.key} className="rounded-xl border border-border/50 bg-card/45 p-3">
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold tracking-tight">{section.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${section.badgeClass}`}>
                          {section.tasks.length}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{section.hint}</p>
                    </div>
                  </div>

                  {section.tasks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-3 text-xs text-muted-foreground">
                      No tasks in this section yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {section.tasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggleComplete={toggleTaskComplete}
                          onEdit={handleEdit}
                          onDelete={moveToTrash}
                          onClick={setSelectedTask}
                          showProject={false}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        )}
      </div>

      <TaskAddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddTask}
      />

      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        projectName={project.name}
        onConfirm={handleDeleteProject}
        isDeleting={isDeleting}
      />
    </div>
  );
}
