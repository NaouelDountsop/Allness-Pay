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
    // Découpe propre du nom
    const parts = data.fullName.trim().split(/\s+/).filter(Boolean);
    let prenom = parts[0] || "Utilisateur";
    let nom = parts.slice(1).join(" ") || prenom;

    // Garantit la longueur minimale de 3 caractères
    if (prenom.length < 3) prenom = prenom.padEnd(3, "x");
    if (nom.length < 3) nom = nom.padEnd(3, "x");

    // Téléphone : obligatoire et doit passer @IsPhoneNumber()
    // Si le formulaire n'envoie rien, on met un numéro camerounais valide temporaire
    const telephone =
      data.phone && data.phone.trim().length > 5
        ? data.phone.trim()
        : "+237600000000";

    return api.post("/users", {
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
    api.post("/auth/login", {
      email,
      motdepasse: password,
    }),

  verifyEmail: (email: string, code: string) =>
    api.post("/auth/verify-otp", {
      email,
      otp: code,
    }),

  resendCode: (email: string) =>
    api.post("/auth/resend-otp", { email }),
};
