import apiClient, { unwrap } from '../lib/apiClient';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
}

export interface RoleInput {
  name: string;
  description?: string;
  permissions: string[];
}

class RoleService {
  static async getRoles(): Promise<Role[]> {
    return unwrap(apiClient.get('/roles'));
  }

  static async getRoleById(id: number): Promise<Role> {
    return unwrap(apiClient.get(`/roles/${id}`));
  }

  static async createRole(input: RoleInput): Promise<Role> {
    return unwrap(apiClient.post('/roles', input));
  }

  static async updateRole(id: number, input: Partial<RoleInput>): Promise<Role> {
    return unwrap(apiClient.put(`/roles/${id}`, input));
  }

  static async deleteRole(id: number): Promise<void> {
    return unwrap(apiClient.delete(`/roles/${id}`));
  }
}

export default RoleService;
