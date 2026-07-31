import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
const baseURL =
  rawBase.replace(/\/$/, "") +
  (rawBase.includes("/api/v1")
    ? ""
    : rawBase.includes("/api")
      ? "/v1"
      : "/api/v1");

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RegisterPayload {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  profession?: string;
  googleId?: string;
}

export const authService = {
  register: (data: RegisterPayload) => {
    const fullName = (data.fullName ?? "").trim();
    const parts = fullName.split(/\s+/).filter(Boolean);

    let prenom = parts[0] || "Utilisateur";
    let nom = parts.slice(1).join(" ") || prenom;

    if (prenom.length < 3) prenom = prenom.padEnd(3, "x");
    if (nom.length < 3) nom = nom.padEnd(3, "x");

    const telephone = (data.phone ?? "").trim().replace(/\s+/g, "");

    let datenaissance: string;
    if (data.birthDate) {
      const d = new Date(data.birthDate);
      datenaissance = isNaN(d.getTime())
        ? new Date().toISOString()
        : d.toISOString();
    } else {
      datenaissance = new Date().toISOString();
    }

    const city = (data.city ?? "").trim();
    const pays = (data.country ?? "").trim() || "Cameroun";
    const profession = (data.profession ?? "").trim() || "Etudiant";

    const payload: Record<string, string> = {
      nom,
      prenom,
      datenaissance,
      sexe: "M",
      pays,
      ville: city || "N/A",
      telephone,
      adresse: city || "N/A",
      email: (data.email ?? "").trim().toLowerCase(),
      motdepasse: data.password || "google-oauth",
      profession,
    };

    if (data.googleId) {
      payload.googleId = data.googleId;
    }

    return api.post("/users", payload);
  },

  login: (email: string, password: string) =>
    api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      motdepasse: password,
    }),

  logout: () => {
    const token = localStorage.getItem("afrilink_access_token");
    return api.post(
      "/auth/logout",
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
  },

  verifyEmail: (email: string, code: string) =>
    api.post("/auth/verify-otp", {
      email: email.trim().toLowerCase(),
      otp: code.trim(),
    }),

  resendCode: (email: string) =>
    api.post("/auth/resend-otp", {
      email: email.trim().toLowerCase(),
    }),
};
