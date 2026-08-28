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
  reporter: User | null;
  estimatedHours: number | null;
  actualHours: number | null;
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
  estimatedHours?: number;
  actualHours?: number;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: number;
  assigneeId?: number;
  status?: string;
  priority?: string;
  mine?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BulkTaskChanges {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  projectId?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

class TaskService {
  static async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const result = await unwrap<PaginatedResult<Task>>(
      apiClient.get('/tasks', { params: { limit: 1000, ...filters } }),
    );
    return result.items;
  }

  static async getTasksPage(filters?: TaskFilters): Promise<PaginatedResult<Task>> {
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

  static async bulkUpdateTasks(ids: number[], changes: BulkTaskChanges): Promise<Task[]> {
    return unwrap(apiClient.patch('/tasks/bulk', { ids, changes }));
  }
}

export default TaskService;
