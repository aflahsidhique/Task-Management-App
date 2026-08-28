import apiClient, { unwrap } from '../lib/apiClient';
import { User } from './userService';

export type ProjectStatus = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  owner: User | null;
  members: User[];
  progressPercent: number;
  memberCount: number;
}

export interface ProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate: string;
  endDate: string;
  ownerId: number;
  memberIds?: number[];
}

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
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

class ProjectService {
  static async getProjects(params?: ListProjectsParams): Promise<Project[]> {
    const result = await unwrap<PaginatedResult<Project>>(
      apiClient.get('/projects', { params: { limit: 1000, ...params } }),
    );
    return result.items;
  }

  static async getProjectsPage(
    params?: ListProjectsParams,
  ): Promise<PaginatedResult<Project>> {
    return unwrap(apiClient.get('/projects', { params }));
  }

  static async getProjectById(id: number): Promise<Project> {
    return unwrap(apiClient.get(`/projects/${id}`));
  }

  static async createProject(input: ProjectInput): Promise<Project> {
    return unwrap(apiClient.post('/projects', input));
  }

  static async updateProject(id: number, input: Partial<ProjectInput>): Promise<Project> {
    return unwrap(apiClient.put(`/projects/${id}`, input));
  }

  static async deleteProject(id: number): Promise<void> {
    return unwrap(apiClient.delete(`/projects/${id}`));
  }

  static async addMember(id: number, userId: number): Promise<Project> {
    return unwrap(apiClient.post(`/projects/${id}/members`, { userId }));
  }

  static async removeMember(id: number, userId: number): Promise<Project> {
    return unwrap(apiClient.delete(`/projects/${id}/members/${userId}`));
  }
}

export default ProjectService;
