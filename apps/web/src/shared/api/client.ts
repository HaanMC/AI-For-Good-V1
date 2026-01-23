export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const apiUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(`[api] VITE_API_BASE_URL=${API_BASE || '(missing)'}`);
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  if (!API_BASE) {
    throw new Error('VITE_API_BASE_URL is not configured at build time.');
  }
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(apiUrl(path), { ...init, headers, credentials: 'include' });
}
