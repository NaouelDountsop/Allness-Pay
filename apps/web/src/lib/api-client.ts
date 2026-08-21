// eslint-disable-next-line no-restricted-imports -- ce fichier EST le client HTTP
import axios, { type AxiosError, type AxiosInstance } from 'axios';

/**
 * Client HTTP unique de l'application.
 *
 * Aucun composant n'appelle `axios` ou `fetch` directement : les appels passent
 * par les fonctions d'API de chaque fonctionnalite, qui utilisent ce client.
 * C'est ce qui permet de traiter l'authentification, la correlation et les
 * erreurs en un seul endroit.
 */

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

/** Forme normalisee des erreurs renvoyees par l'API. */
export interface ApiError {
  statusCode: number;
  /** Code metier stable, sur lequel le front peut brancher un message traduit. */
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
}

/**
 * Fournisseur du jeton d'acces.
 *
 * Injecte depuis le magasin de session au demarrage, afin que cette couche ne
 * depende pas du magasin (et evite un cycle d'import).
 */
let accessTokenProvider: () => string | null = () => null;

export function setAccessTokenProvider(provider: () => string | null): void {
  accessTokenProvider = provider;
}

apiClient.interceptors.request.use((config) => {
  const token = accessTokenProvider();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // On exclut les endpoints d'authentification pour ne pas interferer avec le flow de login
    const url = originalRequest?.url ?? '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.headers['X-Retry'] &&
      !isAuthEndpoint
    ) {
      const { isRefreshing, failedQueue, processQueue } = await import('@/lib/api/token-refresh');

      // Premier 401 → on lance le refresh
      if (!isRefreshing.value) {
        isRefreshing.value = true;
        try {
          const { handleRefreshToken } = await import('@/lib/api/token-refresh');
          const newToken = await handleRefreshToken();
          processQueue(null, newToken);
          isRefreshing.value = false;

          // Retry directement avec le nouveau token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['X-Retry'] = 'true';
          return apiClient(originalRequest);
        } catch (refreshError) {
          isRefreshing.value = false;
          processQueue(refreshError);
          const { onRefreshError } = await import('@/lib/api/token-refresh');
          onRefreshError(() => {
            window.location.href = '/login';
          });
          return Promise.reject(
            error.response?.data ?? {
              statusCode: 401,
              code: 'UNAUTHORIZED',
              message: 'Session expirée. Veuillez vous reconnecter.',
              requestId: 'unknown',
            },
          );
        }
      }

      // Autres 401 → on attend le refresh en cours
      try {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({
            resolve: resolve as (value: unknown) => void,
            reject,
          });
        });
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['X-Retry'] = 'true';
        return apiClient(originalRequest);
      } catch {
        return Promise.reject(
          error.response?.data ?? {
            statusCode: 401,
            code: 'UNAUTHORIZED',
            message: 'Session expirée.',
            requestId: 'unknown',
          },
        );
      }
    }

    // On normalise ici pour que le reste de l'application n'ait jamais a
    // distinguer une panne reseau d'une erreur applicative.
    const normalized: ApiError = error.response?.data ?? {
      statusCode: error.response?.status ?? 0,
      code: error.code === 'ECONNABORTED' ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
      message: 'Impossible de joindre le service. Verifiez votre connexion.',
      requestId: 'unknown',
    };

    return Promise.reject(normalized);
  },
);
