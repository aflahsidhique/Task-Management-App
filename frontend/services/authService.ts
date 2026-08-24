import apiClient, { unwrap } from '../lib/apiClient';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  jobTitle: string | null;
  avatarUrl: string | null;
  role: { id: number; name: string } | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    return unwrap(apiClient.post('/auth/login', { email, password }));
  }

  static async me(): Promise<AuthUser> {
    return unwrap(apiClient.get('/auth/me'));
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return unwrap(apiClient.put('/auth/change-password', { currentPassword, newPassword }));
  }
}

export default AuthService;
