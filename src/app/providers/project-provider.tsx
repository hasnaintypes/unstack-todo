import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/features/projects/types/project.types";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ProjectContext, type ProjectContextValue } from "@/app/context/project-context";
import { queryKeys } from "@/shared/lib/query-keys";
import {
  useProjectsQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "@/features/projects/hooks/use-projects-query";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.$id;
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useProjectsQuery(userId);

  const addProjectMutation = useAddProjectMutation(userId);
  const updateProjectMutation = useUpdateProjectMutation(userId);
  const deleteProjectMutation = useDeleteProjectMutation(userId);

  const addProject = React.useCallback(
    async (data: { name: string; description?: string; color?: string; icon?: string }) => {
      if (!userId) throw new Error("User not authenticated");
      return addProjectMutation.mutateAsync(data);
    },
    [userId, addProjectMutation]
  );

  const updateProject = React.useCallback(
    async (
      id: string,
      updates: Partial<
        Pick<
          Project,
          "name" | "description" | "color" | "icon" | "isFavorite" | "isArchived" | "order"
        >
      >
    ) => {
      await updateProjectMutation.mutateAsync({ id, updates });
    },
    [updateProjectMutation]
  );

  const deleteProject = React.useCallback(
    async (id: string) => {
      if (!userId) throw new Error("User not authenticated");
      await deleteProjectMutation.mutateAsync(id);
    },
    [userId, deleteProjectMutation]
  );

  const refreshProjects = React.useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({
      queryKey: queryKeys.projects.all(userId),
    });
  }, [userId, queryClient]);

  const value: ProjectContextValue = {
    projects,
    isLoading,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
