/**
 * Calcule la date de clôture d'un cycle actif
 * basée sur activatedAt + durée de la fréquence.
 */
export function getCycleClosingTime(
  frequency: string,
  activatedAt?: string | null,
  createdAt?: string | null,
  dueDate?: string | null,
): number | null {
  const freqMs: Record<string, number> = {
    WEEKLY: 7 * 24 * 60 * 60 * 1000,
    BIWEEKLY: 14 * 24 * 60 * 60 * 1000,
    MONTHLY: 30 * 24 * 60 * 60 * 1000,
  };

  const startReference = activatedAt
    ? new Date(activatedAt).getTime()
    : new Date(createdAt ?? dueDate ?? '').getTime();

  if (!startReference || isNaN(startReference)) return null;

  const duration: number = freqMs[frequency] ?? 30 * 24 * 60 * 60 * 1000;
  return startReference + duration;
}

/**
 * Formate une date de clôture en texte lisible (fr-FR).
 */
export function formatClosingDate(closingTime: number | null): string {
  if (!closingTime) return '—';
  return new Date(closingTime).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
