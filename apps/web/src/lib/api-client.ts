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

const baseURL = import.meta.env.VITE_API_URL ?? 'http://192.168.1.158:3000/api/v1';

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
  (error: AxiosError<ApiError>) => {
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
