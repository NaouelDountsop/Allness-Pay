import { useTranslation } from 'react-i18next';
import { CalendarDays, Check, Clock } from 'lucide-react';

export function ScheduledPaymentsBanner() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">{t('payments.scheduled.title')}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">
          {t('payments.scheduled.description')}
        </p>
        <a
          href="#"
          className="text-xs text-allness-green font-medium inline-flex items-center gap-1"
        >
          {t('payments.scheduled.learnMore')}
          <span className="text-allness-green">→</span>
        </a>
      </div>
      <div className="relative shrink-0 w-24 h-24">
        {/* Calendar icon illustration */}
        <div className="w-20 h-20 rounded-2xl bg-allness-dark/5 flex items-center justify-center">
          <CalendarDays className="w-10 h-10 text-allness-dark/40" />
        </div>
        {/* Green check badge */}
        <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-allness-green flex items-center justify-center border-2 border-white">
          <Check className="w-3.5 h-3.5 text-white" />
        </span>
        {/* Clock badge */}
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-allness-orange flex items-center justify-center border-2 border-white">
          <Clock className="w-3 h-3 text-white" />
        </span>
      </div>
    </div>
  );
}
