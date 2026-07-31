import { setAccessTokenProvider } from "@/lib/api-client";

const TOKEN_KEY = "afrilink_access_token";
const REFRESH_TOKEN_KEY = "afrilink_refresh_token";

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),

  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Branche le token stocké sur le client HTTP (api-client.ts attend ce provider)
setAccessTokenProvider(() => authStorage.getToken());
