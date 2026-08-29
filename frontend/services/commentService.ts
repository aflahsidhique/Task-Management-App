import apiClient, { unwrap } from '../lib/apiClient';
import { User } from './userService';

export interface Comment {
  id: number;
  content: string;
  author: User;
  task: { id: number; title: string } | null;
  project: { id: number; name: string } | null;
  mentions: User[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  content: string;
  taskId?: number;
  projectId?: number;
  mentionedUserIds?: number[];
}

export interface UpdateCommentInput {
  content: string;
  mentionedUserIds?: number[];
}

class CommentService {
  static async getComments(params: { taskId?: number; projectId?: number }): Promise<Comment[]> {
    return unwrap(apiClient.get('/comments', { params }));
  }

  static async createComment(input: CreateCommentInput): Promise<Comment> {
    return unwrap(apiClient.post('/comments', input));
  }

  static async updateComment(id: number, input: UpdateCommentInput): Promise<Comment> {
    return unwrap(apiClient.put(`/comments/${id}`, input));
  }

  static async deleteComment(id: number): Promise<void> {
    return unwrap(apiClient.delete(`/comments/${id}`));
  }
}

export default CommentService;
