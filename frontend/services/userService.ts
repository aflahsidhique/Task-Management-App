import apiClient, { unwrap } from '../lib/apiClient';

export interface UserRole {
  id: number;
  name: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: number;
  fullName: string;
  email: string;
  jobTitle: string | null;
  avatarUrl: string | null;
  mobile: string | null;
  role: UserRole | null;
  status: UserStatus;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  jobTitle?: string;
  avatarUrl?: string;
  mobile?: string;
  roleId: number;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>> & {
  status?: UserStatus;
};

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  roleId?: number;
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

class UserService {
  static async getUsers(params?: ListUsersParams): Promise<User[]> {
    const result = await unwrap<PaginatedResult<User>>(
      apiClient.get('/users', { params: { limit: 1000, ...params } }),
    );
    return result.items;
  }

  static async getUsersPage(params?: ListUsersParams): Promise<PaginatedResult<User>> {
    return unwrap(apiClient.get('/users', { params }));
  }

  static async getUserById(id: number): Promise<User> {
    return unwrap(apiClient.get(`/users/${id}`));
  }

  static async createUser(input: CreateUserInput): Promise<User> {
    return unwrap(apiClient.post('/users', input));
  }

  static async updateUser(id: number, input: UpdateUserInput): Promise<User> {
    return unwrap(apiClient.put(`/users/${id}`, input));
  }

  static async activateUser(id: number): Promise<User> {
    return unwrap(apiClient.patch(`/users/${id}/activate`));
  }

  static async deactivateUser(id: number): Promise<User> {
    return unwrap(apiClient.patch(`/users/${id}/deactivate`));
  }

  static async deleteUser(id: number): Promise<void> {
    return unwrap(apiClient.delete(`/users/${id}`));
  }
}

export default UserService;
