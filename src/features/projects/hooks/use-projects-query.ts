import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/features/projects/services/project.service";
import { queryKeys } from "@/shared/lib/query-keys";
import type { Project } from "@/features/projects/types/project.types";

export function useProjectsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.all(userId ?? ""),
    queryFn: () => projectService.getAllProjects(userId!),
    enabled: !!userId,
  });
}

export function useAddProjectMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.projects.all(userId ?? "");

  return useMutation({
    mutationFn: (data: { name: string; description?: string; color?: string; icon?: string }) =>
      projectService.createProject(data, userId!),
    onSuccess: (newProject) => {
      queryClient.setQueryData<Project[]>(queryKey, (old) =>
        old ? [...old, newProject] : [newProject]
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateProjectMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.projects.all(userId ?? "");

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<
        Pick<
          Project,
          "name" | "description" | "color" | "icon" | "isFavorite" | "isArchived" | "order"
        >
      >;
    }) => projectService.updateProject(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<Project[]>(queryKey, (old) =>
        old?.map((p) => (p.id === updated.id ? updated : p))
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDeleteProjectMutation(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.projects.all(userId ?? "");

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id, userId!),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Project[]>(queryKey);
      queryClient.setQueryData<Project[]>(queryKey, (old) =>
        old?.filter((p) => p.id !== id)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
