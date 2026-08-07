import { setAccessTokenProvider } from "@/lib/api-client";

const TOKEN_KEY = "afrilink_access_token";
const REFRESH_TOKEN_KEY = "afrilink_refresh_token";

export const authStorage = {
  getToken: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clearToken: () => sessionStorage.removeItem(TOKEN_KEY),

  getRefreshToken: (): string | null => sessionStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => sessionStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => sessionStorage.removeItem(REFRESH_TOKEN_KEY),

  clearAll: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Branche le token stocké sur le client HTTP (api-client.ts attend ce provider)
setAccessTokenProvider(() => authStorage.getToken());
