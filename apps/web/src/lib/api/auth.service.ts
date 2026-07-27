import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ex: http://localhost:3000/api
  withCredentials: true,
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
  register: (data: RegisterPayload) => api.post("/auth/register", data),
  verifyEmail: (email: string, code: string) =>
    api.post("/auth/verify-email", { email, code }),
  resendCode: (email: string) => api.post("/auth/resend-code", { email }),
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
};
