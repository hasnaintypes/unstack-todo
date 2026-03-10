import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { useProjects } from "@/app/providers/project-provider";
import { useTasks } from "@/app/providers/task-provider";
import { TaskItem } from "@/features/tasks/components/task-item";
import { TaskAddDialog } from "@/features/tasks/components/task-add-dialog";
import { TaskEmptyState } from "@/features/tasks/components/empty-state";
import { projectTaskEmptyState } from "@/assets";
import { ProjectHeader } from "@/features/projects/components/project-header";
import { ProjectStatCards, ProjectCharts } from "@/features/projects/components/project-stats";
import { ProjectNotFound } from "@/features/projects/components/project-not-found";
import type { CalendarTask } from "@/features/tasks/types/task.types";
import { generateTaskSuggestions } from "@/shared/services/ai.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/projects/$projectId")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const { projects } = useProjects();
  const { tasks, addTask, updateTask, toggleTaskComplete, moveToTrash } = useTasks();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CalendarTask | undefined>();
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const project = projects.find((p) => p.id === projectId);

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.project === project?.name),
    [tasks, project?.name]
  );

  const handleAiGenerate = useCallback(async () => {
    if (!project || isAiGenerating) return;
    setIsAiGenerating(true);
    try {
      const suggestions = generateTaskSuggestions(project.name, project.description || "");
      for (const s of suggestions) {
        await addTask({
          title: s.title,
          description: s.description + " [AI Generated]",
          dueDate: "",
          priority: s.priority,
          project: project.name,
          status: "todo",
        });
      }
      toast.success(`${suggestions.length} tasks generated`, {
        description: `AI tasks added to "${project.name}"`,
      });
    } catch (err) {
      console.error("Error generating AI tasks:", err);
      toast.error("Failed to generate tasks");
    } finally {
      setIsAiGenerating(false);
    }
  }, [addTask, project, isAiGenerating]);

  const handleAddTask = (taskData: Partial<CalendarTask>) => {
    addTask({
      ...taskData,
      project: project?.name,
    } as Omit<CalendarTask, "id">);
  };

  const handleEditTask = (taskData: Partial<CalendarTask>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(undefined);
    }
  };

  const handleEditClick = (task: CalendarTask) => {
    setEditingTask(task);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) setEditingTask(undefined);
    setIsAddDialogOpen(open);
  };

  if (!project) {
    return <ProjectNotFound />;
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        onAiGenerate={handleAiGenerate}
        isAiGenerating={isAiGenerating}
        onAddTask={() => setIsAddDialogOpen(true)}
      />

      <ProjectStatCards tasks={projectTasks} />
      <ProjectCharts tasks={projectTasks} />

      {/* Task List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tasks</h2>
          {projectTasks.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {projectTasks.length} task{projectTasks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {projectTasks.length === 0 ? (
          <TaskEmptyState
            image={projectTaskEmptyState}
            imageAlt="No tasks in project"
            title={project.name}
            heading="No tasks yet"
            description="Add tasks manually or use AI to generate them."
            onAddTask={() => setIsAddDialogOpen(true)}
          />
        ) : (
          <div className="space-y-1">
            {projectTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskComplete}
                onEdit={handleEditClick}
                onDelete={moveToTrash}
                showProject={false}
              />
            ))}
          </div>
        )}
      </div>

      <TaskAddDialog
        task={editingTask}
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSave={editingTask ? handleEditTask : handleAddTask}
      />
    </div>
  );
}
