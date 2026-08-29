import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ProjectService, {
  ListProjectsParams,
  PaginatedResult,
  Project,
  ProjectInput,
} from '../services/projectService';

export const projectKeys = {
  all: ['projects'] as const,
  list: (params: ListProjectsParams) => [...projectKeys.all, 'list', params] as const,
};

export function useProjectsQuery(params: ListProjectsParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => ProjectService.getProjectsPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectInput) => ProjectService.createProject(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ProjectInput> }) =>
      ProjectService.updateProject(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ProjectService.deleteProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.all });
      const previous = queryClient.getQueriesData<PaginatedResult<Project>>({
        queryKey: projectKeys.all,
      });
      previous.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.filter((project) => project.id !== id),
          meta: { ...data.meta, totalItems: Math.max(0, data.meta.totalItems - 1) },
        });
      });
      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: projectKeys.all }),
  });
}
