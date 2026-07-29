import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
const baseURL = rawBase.replace(/\/$/, "") + (rawBase.includes("/api/v1") ? "" : rawBase.includes("/api") ? "/v1" : "/api/v1");

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RegisterPayload {
  companyName: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
  city?: string;
}

export const authService = {
  register: (data: RegisterPayload) =>
    api.post("/users", {
      nom: data.fullName.split(" ")[1] ?? data.fullName,
      prenom: data.fullName.split(" ")[0] ?? data.fullName,
      datenaissance: data.birthDate ?? new Date().toISOString(),
      sexe: "U",
      nationalite: "N/A",
      pays: data.city ?? "N/A",
      ville: data.city ?? "N/A",
      telephone: data.phone ?? "+0000000000",
      adresse: data.city ?? "N/A",
      email: data.email,
      motdepasse: data.password,
      profession: "N/A",
    }),
  // The backend currently does not expose /auth/* endpoints. Keep verify/login
  // helpers but they will fail until the backend implements them. For now,
  // frontend registration creates a user via POST /users.
  verifyEmail: (email: string, code: string) =>
    api.post("/auth/verify-email", { email, code }),
  resendCode: (email: string) => api.post("/auth/resend-code", { email }),
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
};
