import apiClient, { unwrap } from '../lib/apiClient';
import { User } from './userService';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  project: { id: number; name: string } | null;
  assignee: User | null;
  createdBy: User | null;
  completedAt: string | null;
}

export interface TaskInput {
  title: string;
  description: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  projectId?: number;
  assigneeId?: number;
}

export interface TaskFilters {
  projectId?: number;
  assigneeId?: number;
  status?: string;
  priority?: string;
  mine?: boolean;
}

class TaskService {
  static async getTasks(filters?: TaskFilters): Promise<Task[]> {
    return unwrap(apiClient.get('/tasks', { params: filters }));
  }

  static async getTaskById(id: string | number): Promise<Task> {
    return unwrap(apiClient.get(`/tasks/${id}`));
  }

  static async createTask(task: TaskInput): Promise<Task> {
    return unwrap(apiClient.post('/tasks', task));
  }

  static async deleteTask(id: number): Promise<void> {
    return unwrap(apiClient.delete(`/tasks/${id}`));
  }

  static async updateTask(id: string | number, task: Partial<TaskInput>): Promise<Task> {
    return unwrap(apiClient.put(`/tasks/${id}`, task));
  }
}

export default TaskService;
