import { useState } from 'react';
import { X } from 'lucide-react';
import { type BannerVariant, alertVariantStyles } from '@/styles/banners';

interface AlertBannerProps {
  variant: BannerVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function AlertBanner({
  variant,
  title,
  message,
  dismissible = true,
  onDismiss,
  className = '',
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const styles = alertVariantStyles[variant];

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className={`mb-4 sm:mb-6 rounded-xl border ${styles.bg} ${styles.border} px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${className}`}
    >
      <div className="flex items-start gap-3 flex-1">
        {styles.icon}
        <div className="flex-1">
          {title && <p className={`text-sm font-semibold ${styles.text} mb-0.5`}>{title}</p>}
          <p className={`text-sm ${styles.text} leading-relaxed`}>{message}</p>
        </div>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors ${styles.text}`}
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
