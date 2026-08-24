import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      window.localStorage.removeItem('accessToken');
      document.cookie = 'token=; path=/; max-age=0';
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const result = await promise;
    return result.data;
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
