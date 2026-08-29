'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AuthService, { AuthUser } from '../services/authService';
import { clearAuthTokens, getAccessToken, setAuthTokens } from '../lib/authStorage';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Mirrors the backend's PermissionsGuard: checks the current user's
   * Role.permissions array. */
  hasPermission: (permission: string) => boolean;
  /** Mirrors the backend's RolesGuard: Super Admin always passes. */
  hasRole: (...roleNames: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      setIsLoading(false);
      return;
    }
    AuthService.me()
      .then(setUser)
      .catch(() => clearAuthTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken, user: loggedInUser } = await AuthService.login(
      email,
      password,
    );
    setAuthTokens(accessToken, refreshToken);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    AuthService.logout().catch(() => {
      // Best-effort server-side revocation; the client-side token clear
      // below is what actually ends the session either way.
    });
    clearAuthTokens();
    setUser(null);
    window.location.href = '/login';
  }, []);

  const hasRole = useCallback(
    (...roleNames: string[]) => {
      const name = user?.role?.name;
      if (!name) return false;
      return name === 'Super Admin' || roleNames.includes(name);
    },
    [user],
  );

  const hasPermission = useCallback(
    (permission: string) => {
      if (hasRole('Super Admin')) return true;
      return !!user?.role?.permissions?.includes(permission);
    },
    [user, hasRole],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
