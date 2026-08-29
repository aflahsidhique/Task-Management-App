import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import FileService from '../services/fileService';

export const fileKeys = {
  all: ['files'] as const,
  list: (params: { projectId?: number; taskId?: number }) =>
    [...fileKeys.all, 'list', params] as const,
};

export function useFilesQuery(params: { projectId?: number; taskId?: number }) {
  return useQuery({
    queryKey: fileKeys.list(params),
    queryFn: () => FileService.getFiles(params),
  });
}

export function useUploadFile(params: { projectId?: number; taskId?: number }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => FileService.upload(file, params.projectId, params.taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fileKeys.list(params) }),
  });
}

export function useDeleteFile(params: { projectId?: number; taskId?: number }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => FileService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fileKeys.list(params) }),
  });
}
