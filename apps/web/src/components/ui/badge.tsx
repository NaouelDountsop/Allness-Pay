import type { BadgeTone } from '../../types';

const TONE_STYLES: Record<BadgeTone, string> = {
  green: 'bg-allness-green/10 text-allness-green',
  orange: 'bg-allness-orange/10 text-allness-orange',
  red: 'bg-red-500/10 text-red-500',
  blue: 'bg-blue-500/10 text-blue-500',
  gray: 'bg-gray-200/60 text-gray-500',
  purple: 'bg-purple-500/10 text-purple-500',
  amber: 'bg-amber-500/10 text-amber-500',
};

const DOT_STYLES: Record<BadgeTone, string> = {
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  gray: 'bg-gray-400',
  purple: 'bg-purple-500',
  amber: 'bg-amber-500',
};

export function Badge({
  tone = 'gray',
  children,
  dot = false,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${TONE_STYLES[tone]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[tone]}`} />}
      {children}
    </span>
  );
}
