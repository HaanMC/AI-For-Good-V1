import { apiFetch as baseApiFetch } from '../api/client';
import { showToast } from '../utils/toast';

type RequestOptions = RequestInit & { requireAuth?: boolean };

export const apiFetch = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await baseApiFetch(path, options);
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
