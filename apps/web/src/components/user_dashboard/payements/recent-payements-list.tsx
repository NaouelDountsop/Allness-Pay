import { useTranslation } from 'react-i18next';
import { Receipt, ChevronRight } from 'lucide-react';
import type { RecentPayment } from '@/lib/mock/payments-data';

interface RecentPaymentsListProps {
  payments: RecentPayment[];
}

export function RecentPaymentsList({ payments }: RecentPaymentsListProps) {
  const { t } = useTranslation();

  const statusStyles: Record<string, { label: string; className: string }> = {
    paid: { label: t('payments.recent.paid'), className: 'bg-green-50 text-green-600' },
    pending: { label: t('payments.recent.pending'), className: 'bg-orange-50 text-allness-orange' },
  };

  const defaultStatus = statusStyles.pending;

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">{t('payments.recent.title')}</h3>
        <a href="#" className="text-xs text-allness-green font-medium">
          {t('payments.recent.viewAll')}
        </a>
      </div>
      <ul className="divide-y divide-gray-100">
        {payments.map((p) => {
          const status = (statusStyles[p.status] ?? defaultStatus) as { label: string; className: string };
          return (
            <li key={p.id} className="flex items-center justify-between py-3 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4 text-gray-400" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate">{p.label}</p>
                  {p.reference && (
                    <p className="text-[11px] text-gray-400 truncate">{p.reference}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-right whitespace-nowrap">
                  {new Intl.NumberFormat('fr-FR').format(p.amount)}{' '}
                  <span className="hidden sm:inline">FCFA</span>
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.className}`}
                >
                  {status.label}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
