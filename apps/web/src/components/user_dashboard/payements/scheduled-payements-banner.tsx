import { CalendarClock } from 'lucide-react';
import { scheduledPaymentsBannerStyle } from '@/styles/banners';

export function ScheduledPaymentsBanner() {
  const s = scheduledPaymentsBannerStyle;

  return (
    <div className={s.wrapper}>
      <span className={s.iconWrapper}>
        <CalendarClock className={`w-5 h-5 ${s.iconColor}`} />
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-medium ${s.titleColor} mb-0.5`}>Paiements programmés</p>
        <p className={`text-xs ${s.descriptionColor} line-clamp-3`}>
          Ne manquez plus jamais une échéance en activant le prélèvement automatique sur votre
          wallet AllnessPay.{' '}
          <a href="#" className={`${s.linkColor} font-medium`}>
            En savoir plus
          </a>
        </p>
      </div>
    </div>
  );
}
