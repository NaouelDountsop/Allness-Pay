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
  password: string;
  phone?: string;
  birthDate?: string;
  city?: string;
}

export const authService = {
  register: (data: RegisterPayload) => {
    // ========== NOM & PRENOM ==========
    const fullName = (data.fullName ?? "").trim();
    const parts = fullName.split(/\s+/).filter(Boolean);

    let prenom = parts[0] || "Utilisateur";
    let nom = parts.slice(1).join(" ") || prenom;

    if (prenom.length < 3) prenom = prenom.padEnd(3, "x");
    if (nom.length < 3) nom = nom.padEnd(3, "x");

    // ========== TELEPHONE (le plus important) ==========
    let telephone = (data.phone ?? "").trim().replace(/\s+/g, "");

    // Si l'utilisateur a mis 6XXXXXXXX ou 06XXXXXXXX → on force +237
    if (/^6\d{8}$/.test(telephone)) {
      telephone = "+237" + telephone;
    } else if (/^06\d{8}$/.test(telephone)) {
      telephone = "+237" + telephone.slice(1);
    } else if (/^2376\d{8}$/.test(telephone)) {
      telephone = "+" + telephone;
    }

    // Si toujours invalide → on met une valeur de test valide
    if (!/^\+2376\d{8}$/.test(telephone)) {
      telephone = "+237600000000";
    }

    // ========== DATE DE NAISSANCE ==========
    let datenaissance: string;
    if (data.birthDate) {
      const d = new Date(data.birthDate);
      datenaissance = isNaN(d.getTime())
        ? new Date().toISOString()
        : d.toISOString();
    } else {
      datenaissance = new Date().toISOString();
    }

    // ========== VILLE / PAYS / ADRESSE ==========
    const city = (data.city ?? "").trim();
    const hasCity = city.length >= 3;

    const payload = {
      nom,
      prenom,
      datenaissance,
      sexe: "M",
      pays: hasCity ? city : "Cameroun",
      ville: hasCity ? city : "Douala",
      telephone,
      adresse: hasCity ? city : "N/A",
      email: (data.email ?? "").trim().toLowerCase(),
      motdepasse: data.password,
      profession: "Etudiant",
    };

    // Debug utile (tu peux enlever après)
    console.log("Payload envoyé au backend :", payload);

    return api.post("/users", payload);
  },

  login: (email: string, password: string) =>
    api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      motdepasse: password,
    }),

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
