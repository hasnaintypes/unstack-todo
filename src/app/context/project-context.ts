import { createContext } from "react";
import type { Project } from "@/features/projects/types/project.types";

export interface ProjectContextValue {
  projects: Project[];
  isLoading: boolean;
  addProject: (data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }) => Promise<Project>;
  updateProject: (
    id: string,
    updates: Partial<
      Pick<
        Project,
        "name" | "description" | "color" | "icon" | "isFavorite" | "isArchived" | "order"
      >
    >
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

export const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);
