import { apiClient } from '@/lib/api-client';

export interface RegisterPayload {
  fullName: string;
  nom?: string;
  prenom?: string;
  email: string;
  password?: string;
  phone?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  profession?: string;
  address?: string;
  googleId?: string;
}

export const authService = {
  register: (data: RegisterPayload) => {
    const fullName = (data.fullName ?? '').trim();
    const parts = fullName.split(/\s+/).filter(Boolean);

    let prenom = parts[0] || 'Utilisateur';
    let nom = parts.slice(1).join(' ') || prenom;

    if (prenom.length < 3) prenom = prenom.padEnd(3, 'x');
    if (nom.length < 3) nom = nom.padEnd(3, 'x');

    const telephone = (data.phone ?? '').trim().replace(/\s+/g, '');

    let datenaissance: string;
    if (data.birthDate) {
      const d = new Date(data.birthDate);
      datenaissance = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } else {
      datenaissance = new Date().toISOString();
    }

    const city = (data.city ?? '').trim();
    const pays = (data.country ?? '').trim() || 'Cameroun';
    const profession = (data.profession ?? '').trim() || 'Etudiant';

    const payload: Record<string, string> = {
      nom,
      prenom,
      datenaissance,
      sexe: 'N/A',
      pays,
      ville: city || 'N/A',
      telephone,
      adresse: data.address || 'N/A',
      email: (data.email ?? '').trim().toLowerCase(),
      motdepasse: data.password || 'google-oauth',
      profession,
    };

    if (data.googleId) {
      payload.googleId = data.googleId;
    }

    return apiClient.post('/users', payload);
  },

  getGooglePending: (token: string) =>
    apiClient.get<{ email: string; nom: string; prenom: string }>(`/auth/google/pending/${token}`),

  completeGoogleSignup: (
    token: string,
    data: Omit<RegisterPayload, 'fullName' | 'password'> & {
      gender: string;
      nom?: string;
      prenom?: string;
    },
  ) => {
    const telephone = (data.phone ?? '').trim().replace(/\s+/g, '');
    const city = (data.city ?? '').trim();
    const pays = (data.country ?? '').trim() || 'Cameroun';
    const profession = (data.profession ?? '').trim() || 'Etudiant';

    return apiClient.post(`/auth/google/complete-signup/${token}`, {
      datenaissance: data.birthDate,
      sexe: data.gender,
      pays,
      ville: city || 'N/A',
      telephone,
      adresse: data.address || city || 'N/A',
      email: (data.email ?? '').trim().toLowerCase(),
      profession,
    });
  },

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', {
      email: email.trim().toLowerCase(),
      motdepasse: password,
    }),

  loginAdmin: (email: string, password: string) =>
    apiClient.post('/auth/login-admin', {
      email: email.trim().toLowerCase(),
      motdepasse: password,
    }),

  loginOrAdmin: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login-admin', {
        email: email.trim().toLowerCase(),
        motdepasse: password,
      });
      return {
        ...response,
        data: {
          ...response.data,
          role: 'admin',
        },
      };
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      if (err?.statusCode === 401) {
        const response = await apiClient.post('/auth/login', {
          email: email.trim().toLowerCase(),
          motdepasse: password,
        });
        return {
          ...response,
          data: {
            ...response.data,
            role: 'user',
          },
        };
      }
      throw error;
    }
  },

  logout: () => {
    return apiClient.post('/auth/logout');
  },

  verifyEmail: (email: string, code: string) =>
    apiClient.post('/auth/verify-otp', {
      email: email.trim().toLowerCase(),
      otp: code.trim(),
    }),

  resendCode: (email: string) =>
    apiClient.post('/auth/resend-otp', {
      email: email.trim().toLowerCase(),
    }),
};
