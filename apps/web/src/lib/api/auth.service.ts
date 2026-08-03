import { apiClient } from "@/lib/api-client";

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
    const parts = data.fullName.trim().split(/\s+/).filter(Boolean);
    let prenom = parts[0] || "Utilisateur";
    let nom = parts.slice(1).join(" ") || prenom;

    if (prenom.length < 3) prenom = prenom.padEnd(3, "x");
    if (nom.length < 3) nom = nom.padEnd(3, "x");

    const telephone =
      data.phone && data.phone.trim().length > 5
        ? data.phone.trim()
        : "+237600000000";

    return apiClient.post("/users", {
      nom,
      prenom,
      datenaissance: data.birthDate || new Date().toISOString(),
      sexe: "U",
      pays: data.city && data.city.length >= 3 ? data.city : "Cameroun",
      ville: data.city && data.city.length >= 3 ? data.city : "Douala",
      telephone,
      adresse: data.city && data.city.length >= 3 ? data.city : "N/A",
      email: data.email,
      motdepasse: data.password,
      profession: "Etudiant",
    });
  },

  login: (email: string, password: string) =>
    apiClient.post("/auth/login", {
      email,
      motdepasse: password,
    }),

  verifyEmail: (email: string, code: string) =>
    apiClient.post("/auth/verify-otp", {
      email,
      otp: code,
    }),

  resendCode: (email: string) =>
    apiClient.post("/auth/resend-otp", { email }),
};
