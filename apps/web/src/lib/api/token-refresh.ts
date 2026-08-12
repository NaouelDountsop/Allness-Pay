import { authStorage } from '@/lib/auth-storage';

let _isRefreshing = false;
let _failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

export const processQueue = (error: unknown, token: string | null = null) => {
  _failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  _failedQueue = [];
};

export const isRefreshing = {
  get value() {
    return _isRefreshing;
  },
  set value(v: boolean) {
    _isRefreshing = v;
  },
};

export const failedQueue = {
  push(item: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }) {
    _failedQueue.push(item);
  },
};

export async function handleRefreshToken(): Promise<string> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error('Pas de refresh token');
  }

  const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

  const response = await fetch(`${baseURL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Refresh token invalide');
  }

  const data = await response.json();
  const { access_token, refresh_token } = data;
  authStorage.setToken(access_token);
  authStorage.setRefreshToken(refresh_token);

  return access_token;
}

export function onRefreshError(callback: () => void) {
  authStorage.clearAll();
  callback();
}
