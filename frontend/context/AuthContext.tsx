'use client';

import Cookies from 'js-cookie';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AuthService, { AuthUser } from '../services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    AuthService.me()
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem('accessToken');
        Cookies.remove('token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: loggedInUser } = await AuthService.login(email, password);
    window.localStorage.setItem('accessToken', accessToken);
    Cookies.set('token', accessToken, { expires: 1 });
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('accessToken');
    Cookies.remove('token');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
