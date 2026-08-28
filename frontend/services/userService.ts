import apiClient, { unwrap } from '../lib/apiClient';

export interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  jobTitle: string | null;
  avatarUrl: string | null;
  role: UserRole | null;
  isActive: boolean;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  jobTitle?: string;
  avatarUrl?: string;
  roleId: number;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>> & {
  isActive?: boolean;
};

class UserService {
  static async getUsers(): Promise<User[]> {
    return unwrap(apiClient.get('/users'));
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

  static async deleteUser(id: number): Promise<void> {
    return unwrap(apiClient.delete(`/users/${id}`));
  }
}

export default UserService;
