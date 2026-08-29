import Cookies from 'js-cookie';

/**
 * Single source of truth for where auth tokens live: the access token is
 * duplicated into localStorage (read by apiClient's request interceptor)
 * and a cookie (read by middleware.ts, which runs on the edge and can't
 * see localStorage) — both must always be written/cleared together.
 */
export function setAuthTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('accessToken', accessToken);
  window.localStorage.setItem('refreshToken', refreshToken);
  Cookies.set('token', accessToken, { expires: 1 });
}

export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('refreshToken');
  Cookies.remove('token');
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('refreshToken');
}
