import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import RoleService, { RoleInput } from '../services/roleService';

export const roleKeys = {
  all: ['roles'] as const,
};

export function useRolesQuery() {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: () => RoleService.getRoles(),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RoleInput) => RoleService.createRole(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<RoleInput> }) =>
      RoleService.updateRole(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => RoleService.deleteRole(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roleKeys.all }),
  });
}
