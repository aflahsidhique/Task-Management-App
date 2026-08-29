import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CommentService, {
  CreateCommentInput,
  UpdateCommentInput,
} from '../services/commentService';

export const commentKeys = {
  all: ['comments'] as const,
  forTask: (taskId: number) => [...commentKeys.all, 'task', taskId] as const,
};

export function useTaskComments(taskId: number) {
  return useQuery({
    queryKey: commentKeys.forTask(taskId),
    queryFn: () => CommentService.getComments({ taskId }),
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateCommentInput, 'taskId'>) =>
      CommentService.createComment({ ...input, taskId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentKeys.forTask(taskId) }),
  });
}

export function useUpdateComment(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCommentInput }) =>
      CommentService.updateComment(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentKeys.forTask(taskId) }),
  });
}

export function useDeleteComment(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => CommentService.deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentKeys.forTask(taskId) }),
  });
}
