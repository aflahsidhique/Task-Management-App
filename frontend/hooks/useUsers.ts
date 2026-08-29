import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import UserService, {
  CreateUserInput,
  ListUsersParams,
  PaginatedResult,
  UpdateUserInput,
  User,
} from '../services/userService';

export const userKeys = {
  all: ['users'] as const,
  list: (params: ListUsersParams) => [...userKeys.all, 'list', params] as const,
};

export function useUsersQuery(params: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => UserService.getUsersPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => UserService.createUser(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserInput }) =>
      UserService.updateUser(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => UserService.deleteUser(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });
      const previous = queryClient.getQueriesData<PaginatedResult<User>>({
        queryKey: userKeys.all,
      });
      previous.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.filter((user) => user.id !== id),
          meta: { ...data.meta, totalItems: Math.max(0, data.meta.totalItems - 1) },
        });
      });
      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useSetUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? UserService.activateUser(id) : UserService.deactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
