import { setAccessTokenProvider } from "@/lib/api-client";

const TOKEN_KEY = "afrilink_access_token";

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

// Branche le token stocké sur le client HTTP (api-client.ts attend ce provider)
setAccessTokenProvider(() => authStorage.getToken());
