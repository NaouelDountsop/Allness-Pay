import { Storage } from "../utils/storage";

const raw = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE_URL = raw.replace(/\/$/, "") + (raw.includes("/api/v1") ? "" : raw.includes("/api") ? "/v1" : "/api/v1");

type HttpMethod =
  | "GET"
  | "POST"
  | "PATCH"
  | "PUT"
  | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {

  const token = Storage.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...Object.fromEntries(new Headers(options.headers)),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();

  let data: Record<string, unknown> | null = null;
  try {
    data = text ? JSON.parse(text) as Record<string, unknown> : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const message = (data?.message as string) || `Erreur ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}


export const Api = {

  get<T>(url: string) {
    return request<T>(url);
  },

  post<T>(url: string, body: unknown) {
    return request<T>(url, {
      method: "POST",
      body,
    });
  },

  patch<T>(url: string, body: unknown) {
    return request<T>(url, {
      method: "PATCH",
      body,
    });
  },

  put<T>(url: string, body: unknown) {
    return request<T>(url, {
      method: "PUT",
      body,
    });
  },

  delete<T>(url: string) {
    return request<T>(url, {
      method: "DELETE",
    });
  },
};
