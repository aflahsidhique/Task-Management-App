import axios from 'axios';
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from './authStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function redirectToLogin() {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// Multiple requests can 401 around the same time (e.g. a page firing
// several queries at once); only one refresh call should ever be in
// flight, and every pending request waits on that same promise.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  const { accessToken, refreshToken: nextRefreshToken } = response.data.data;
  setAuthTokens(accessToken, nextRefreshToken);
  return accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window === 'undefined' || !axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login')
      || originalRequest?.url?.includes('/auth/refresh');

    if (!originalRequest || originalRequest._retry || isAuthEndpoint) {
      clearAuthTokens();
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      refreshPromise ||= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newAccessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);

export async function unwrap<T>(promise: Promise<{ data: unknown }>): Promise<T> {
  try {
    const result = await promise;
    const payload = result.data;
    // Backend wraps successful responses as { success, statusCode, data, timestamp }.
    if (
      payload &&
      typeof payload === 'object' &&
      'success' in payload &&
      'data' in payload
    ) {
      return (payload as { data: T }).data;
    }
    return payload as T;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const message =
        (error.response.data as any)?.message || error.response.statusText;
      throw new Error(`Error: ${error.response.status} - ${message}`);
    }
    throw new Error('An unexpected error occurred');
  }
}

export default apiClient;
export { API_BASE_URL };
