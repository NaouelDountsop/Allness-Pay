export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'orange';

export function getStatusVariant(status: string): BadgeVariant {
  const lower = status.toLowerCase();
  if (['active', 'accepted', 'completed', 'success', 'paid', 'approved', 'verified'].includes(lower))
    return 'success';
  if (['pending', 'waiting', 'processing', 'in_progress'].includes(lower)) return 'warning';
  if (['failed', 'rejected', 'expired', 'error', 'suspended', 'cancelled'].includes(lower)) return 'danger';
  if (['inactive', 'closed'].includes(lower)) return 'neutral';
  return 'info';
}
