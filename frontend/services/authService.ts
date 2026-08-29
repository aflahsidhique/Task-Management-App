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
  refreshToken: string;
  user: AuthUser;
}

class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    return unwrap(apiClient.post('/auth/login', { email, password }));
  }

  static async logout(): Promise<void> {
    return unwrap(apiClient.post('/auth/logout'));
  }

  static async me(): Promise<AuthUser> {
    return unwrap(apiClient.get('/auth/me'));
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return unwrap(apiClient.put('/auth/change-password', { currentPassword, newPassword }));
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    return unwrap(apiClient.post('/auth/forgot-password', { email }));
  }

  static async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return unwrap(apiClient.post('/auth/reset-password', { token, password }));
  }
}

export default AuthService;
