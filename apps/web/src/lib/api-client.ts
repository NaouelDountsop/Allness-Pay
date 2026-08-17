// eslint-disable-next-line no-restricted-imports -- ce fichier EST le client HTTP
import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import {
  enqueuePendingRequest,
  isRefreshInProgress,
  rejectPendingRequests,
  requestNewTokens,
  resolvePendingRequests,
  setRefreshInProgress,
} from '@/lib/api/token-refresh';

/**
 * Client HTTP unique de l'application.
 *
 * Aucun composant n'appelle `axios` ou `fetch` directement : les appels passent
 * par les fonctions d'API de chaque fonctionnalite, qui utilisent ce client.
 * C'est ce qui permet de traiter l'authentification, la rotation du jeton et
 * les erreurs en un seul endroit.
 *
 * Ce module ne connait pas le magasin de session : tout ce qui touche au
 * stockage lui est **injecte** par `auth-storage.ts`. Sans cela, les deux
 * fichiers s'importeraient mutuellement.
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

// --- Points d'injection (renseignes par `auth-storage.ts`) ------------------

let accessTokenProvider: () => string | null = () => null;
let refreshTokenProvider: () => string | null = () => null;
let tokensRenewedHandler: (accessToken: string, refreshToken: string) => void = () => {};
let sessionExpiredHandler: () => void = () => {};

export function setAccessTokenProvider(provider: () => string | null): void {
  accessTokenProvider = provider;
}

export function setRefreshTokenProvider(provider: () => string | null): void {
  refreshTokenProvider = provider;
}

/** Appele apres un rafraichissement reussi, pour persister les nouveaux jetons. */
export function setTokensRenewedHandler(
  handler: (accessToken: string, refreshToken: string) => void,
): void {
  tokensRenewedHandler = handler;
}

/** Appele quand la session est definitivement perdue (rafraichissement refuse). */
export function setSessionExpiredHandler(handler: () => void): void {
  sessionExpiredHandler = handler;
}

// --- Requete ----------------------------------------------------------------

apiClient.interceptors.request.use((config) => {
  const token = accessTokenProvider();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Reponse ----------------------------------------------------------------

/** `_retry` empeche qu'une requete rejouee declenche un second rafraichissement. */
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Routes ou un 401 signifie « identifiants invalides » et non « session
 * expiree ». Tenter un rafraichissement n'y aurait aucun sens, et sur
 * `/auth/refresh` cela creerait une boucle.
 */
const NO_REFRESH_PATHS = ['/auth/login', '/auth/login-admin', '/auth/refresh'];

/**
 * Une reponse d'erreur ne porte le contrat `ApiError` que si elle vient bien de
 * notre API. Un proxy, un pare-feu ou une passerelle peut renvoyer du HTML ou
 * un corps vide : le typage seul ne suffit pas a le garantir.
 */
function isApiError(data: unknown): data is ApiError {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as ApiError).code === 'string' &&
    typeof (data as ApiError).message === 'string'
  );
}

function normalizeError(error: AxiosError<ApiError>): ApiError {
  // On normalise pour que le reste de l'application n'ait jamais a distinguer
  // une panne reseau d'une erreur applicative — et pour que `ApiError` soit une
  // promesse tenue, meme quand la reponse ne vient pas de notre API.
  const data = error.response?.data;
  if (isApiError(data)) return data;

  const status = error.response?.status ?? 0;
  return {
    statusCode: status,
    code:
      status > 0
        ? `HTTP_${status}`
        : error.code === 'ECONNABORTED'
          ? 'REQUEST_TIMEOUT'
          : 'NETWORK_ERROR',
    message:
      status > 0
        ? 'Le service a renvoye une reponse inattendue.'
        : 'Impossible de joindre le service. Verifiez votre connexion.',
    requestId: 'unknown',
  };
}

function replay(config: RetriableConfig, accessToken: string) {
  config.headers.Authorization = `Bearer ${accessToken}`;
  return apiClient(config);
}

function shouldAttemptRefresh(
  error: AxiosError<ApiError>,
  config: RetriableConfig | undefined,
): config is RetriableConfig {
  if (!config || config._retry) return false;
  // Uniquement 401 : un 403 (compte suspendu) n'est pas un probleme
  // d'expiration, le rafraichir ne changerait rien.
  if (error.response?.status !== 401) return false;
  if (NO_REFRESH_PATHS.some((path) => (config.url ?? '').includes(path))) return false;
  // Pas de jeton de rafraichissement : l'utilisateur n'est simplement pas
  // connecte. On ne declenche ni rotation ni deconnexion, ce qui eviterait
  // une boucle de redirection sur les pages publiques.
  return Boolean(refreshTokenProvider());
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as RetriableConfig | undefined;

    if (!shouldAttemptRefresh(error, original)) {
      return Promise.reject(normalizeError(error));
    }

    original._retry = true;

    // Un rafraichissement est deja en cours : on attend son issue plutot que
    // d'en declencher un second. Sinon dix requetes simultanees feraient dix
    // rotations, et neuf jetons seraient invalides des leur emission.
    if (isRefreshInProgress()) {
      try {
        const accessToken = await enqueuePendingRequest();
        return await replay(original, accessToken);
      } catch {
        return Promise.reject(normalizeError(error));
      }
    }

    setRefreshInProgress(true);
    try {
      const refreshToken = refreshTokenProvider();
      if (!refreshToken) {
        throw new Error('Aucun jeton de rafraichissement disponible');
      }

      const tokens = await requestNewTokens(baseURL, refreshToken);
      tokensRenewedHandler(tokens.access_token, tokens.refresh_token);
      resolvePendingRequests(tokens.access_token);

      return await replay(original, tokens.access_token);
    } catch (refreshError) {
      rejectPendingRequests(refreshError);
      sessionExpiredHandler();
      return Promise.reject(normalizeError(error));
    } finally {
      setRefreshInProgress(false);
    }
  },
);
