import {
  setAccessTokenProvider,
  setRefreshTokenProvider,
  setSessionExpiredHandler,
  setTokensRenewedHandler,
} from '@/lib/api-client';

const TOKEN_KEY = 'afrilink_access_token';
const REFRESH_TOKEN_KEY = 'afrilink_refresh_token';
const ROLE_KEY = 'afrilink_role';

export const authStorage = {
  getToken: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clearToken: () => sessionStorage.removeItem(TOKEN_KEY),

  getRefreshToken: (): string | null => sessionStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => sessionStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => sessionStorage.removeItem(REFRESH_TOKEN_KEY),

  getRole: (): string | null => sessionStorage.getItem(ROLE_KEY),
  setRole: (role: string) => sessionStorage.setItem(ROLE_KEY, role),

  clearAll: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
  },
};

const LOGIN_ROUTE = '/login';

// Branche le magasin sur le client HTTP. `api-client.ts` ignore volontairement
// comment les jetons sont stockes : il ne connait que ces quatre fonctions.
setAccessTokenProvider(() => authStorage.getToken());
setRefreshTokenProvider(() => authStorage.getRefreshToken());

// Rotation reussie : l'API renvoie un nouveau couple a chaque appel, il faut
// donc remplacer les deux jetons et pas seulement celui d'acces.
setTokensRenewedHandler((accessToken, refreshToken) => {
  authStorage.setToken(accessToken);
  authStorage.setRefreshToken(refreshToken);
});

// Session definitivement perdue : on purge et on renvoie vers la connexion.
setSessionExpiredHandler(() => {
  authStorage.clearAll();
  // Garde anti-boucle : inutile de rediriger si l'on y est deja.
  if (window.location.pathname !== LOGIN_ROUTE) {
    window.location.assign(LOGIN_ROUTE);
  }
});
