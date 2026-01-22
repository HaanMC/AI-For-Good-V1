import { auth } from './firebase';
import { showToast } from '../utils/toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type RequestOptions = RequestInit & { requireAuth?: boolean };

const buildHeaders = async (options: RequestOptions) => {
  const headers = new Headers(options.headers);
  if (options.requireAuth !== false && auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');
  return headers;
};

export const apiFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = await buildHeaders(options);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 429) {
    showToast('Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ít phút.');
  }
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || 'API request failed');
  }
  return response.json() as Promise<T>;
};

export const apiPost = async <T>(path: string, body: unknown, options: RequestOptions = {}) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body), ...options });

export const apiGet = async <T>(path: string, options: RequestOptions = {}) =>
  apiFetch<T>(path, { method: 'GET', ...options });
