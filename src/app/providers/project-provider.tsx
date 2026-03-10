import * as React from "react";
import type { Project } from "@/features/projects/types/project.types";
import { projectService } from "@/features/projects/services/project.service";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface ProjectContextValue {
  projects: Project[];
  isLoading: boolean;
  addProject: (data: { name: string; description?: string; color?: string; icon?: string }) => Promise<Project>;
  updateProject: (
    id: string,
    updates: Partial<Pick<Project, "name" | "description" | "color" | "icon" | "isFavorite" | "isArchived" | "order">>
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = React.createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { user } = useAuth();

  const loadProjects = React.useCallback(async () => {
    if (!user?.$id) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const fetched = await projectService.getAllProjects(user.$id);
      setProjects(fetched);
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.$id]);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const addProject = React.useCallback(
    async (data: { name: string; description?: string; color?: string; icon?: string }) => {
      if (!user?.$id) throw new Error("User not authenticated");
      const newProject = await projectService.createProject(data, user.$id);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    },
    [user?.$id]
  );

  const updateProject = React.useCallback(
    async (
      id: string,
      updates: Partial<Pick<Project, "name" | "description" | "color" | "icon" | "isFavorite" | "isArchived" | "order">>
    ) => {
      const updated = await projectService.updateProject(id, updates);
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    },
    []
  );

  const deleteProject = React.useCallback(async (id: string) => {
    await projectService.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const value: ProjectContextValue = {
    projects,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects: loadProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = React.useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
