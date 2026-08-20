import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from './api-client';

/**
 * Cache des donnees serveur.
 *
 * Regle de separation : tout ce qui vient de l'API vit ici. Le magasin Zustand
 * ne conserve que l'etat d'interface (session, theme, langue). Recopier une
 * reponse d'API dans Zustand cree deux sources de verite qui divergent.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        const apiError = error as unknown as ApiError;
        // Une erreur 4xx ne se resout pas en reessayant : la requete est
        // invalide ou l'acces est refuse.
        if (apiError.statusCode >= 400 && apiError.statusCode < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      // Une mutation n'est jamais rejouee automatiquement : sur une operation
      // financiere, un rejeu non maitrise produirait un doublon.
      retry: false,
    },
  },
});
