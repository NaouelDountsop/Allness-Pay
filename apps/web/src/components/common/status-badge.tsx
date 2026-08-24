import { cn } from '@/lib/utils';
import type { BadgeVariant } from './status-badge-utils';

export type { BadgeVariant } from './status-badge-utils';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-500/10 text-green-500',
  warning: 'bg-yellow-500/10 text-yellow-500',
  danger: 'bg-red-500/10 text-red-500',
  info: 'bg-blue-500/10 text-blue-500',
  neutral: 'bg-gray-500/10 text-gray-500',
  orange: 'bg-allness-orange/10 text-allness-orange',
};

export function StatusBadge({ label, variant = 'neutral', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4',
        variantStyles[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
