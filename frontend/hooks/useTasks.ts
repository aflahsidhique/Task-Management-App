import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import TaskService, {
  BulkTaskChanges,
  PaginatedResult,
  Task,
  TaskFilters,
  TaskInput,
} from '../services/taskService';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: ['tasks', 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists, filters] as const,
  detail: (id: number) => [...taskKeys.all, 'detail', id] as const,
};

export function useTasksQuery(filters: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => TaskService.getTasksPage(filters),
    placeholderData: keepPreviousData,
  });
}

/** Unpaginated task list for views that need the whole matching set at
 * once (the Kanban board groups by status client-side). */
export function useAllTasksQuery(filters: Omit<TaskFilters, 'page' | 'limit'>) {
  return useQuery({
    queryKey: [...taskKeys.all, 'board', filters],
    queryFn: () => TaskService.getTasks(filters),
  });
}

export function useTaskQuery(id: number) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => TaskService.getTaskById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => TaskService.createTask(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<TaskInput> }) =>
      TaskService.updateTask(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useBulkUpdateTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, changes }: { ids: number[]; changes: BulkTaskChanges }) =>
      TaskService.bulkUpdateTasks(ids, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => TaskService.deleteTask(id),
    // Optimistically remove the task from every cached task list immediately,
    // rolling back if the request fails.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists });
      const previous = queryClient.getQueriesData<PaginatedResult<Task>>({
        queryKey: taskKeys.lists,
      });
      previous.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.filter((task) => task.id !== id),
          meta: { ...data.meta, totalItems: Math.max(0, data.meta.totalItems - 1) },
        });
      });
      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
