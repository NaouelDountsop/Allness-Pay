import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { queryClient } from '@/lib/query-client';

/**
 * Composition des fournisseurs de contexte.
 *
 * Un seul endroit ou brancher un nouveau contexte (routeur, traduction, theme),
 * pour que `main.tsx` reste un simple point de montage.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
