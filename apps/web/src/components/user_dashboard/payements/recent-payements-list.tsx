import { useTranslation } from 'react-i18next';
import { Zap, Droplet, Wifi, Tv, Smartphone, Phone, ChevronRight } from 'lucide-react';
import type { RecentPayment } from '@/lib/mock/payments-data';

const providerIconMap: Record<string, typeof Zap> = {
  ENEO: Zap,
  CAMWATER: Droplet,
  'Canal+': Tv,
  MTN: Smartphone,
  Orange: Phone,
  CAMTEL: Wifi,
};

const providerColorMap: Record<string, string> = {
  ENEO: 'bg-yellow-50 text-yellow-600',
  CAMWATER: 'bg-blue-50 text-blue-600',
  'Canal+': 'bg-red-50 text-red-600',
  MTN: 'bg-green-50 text-green-600',
  Orange: 'bg-orange-50 text-orange-600',
  CAMTEL: 'bg-cyan-50 text-cyan-600',
};

interface RecentPaymentsListProps {
  payments: RecentPayment[];
  onViewAll?: () => void;
}

export function RecentPaymentsList({ payments, onViewAll }: RecentPaymentsListProps) {
  const { t } = useTranslation();
  const format = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.abs(n));

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">{t('payments.recent.title')}</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-allness-green font-medium inline-flex items-center gap-1"
        >
          {t('payments.recent.viewAll')}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <ul className="divide-y divide-gray-100">
        {payments.map((p) => {
          const Icon = providerIconMap[p.provider ?? ''] ?? Zap;
          const iconColor = providerColorMap[p.provider ?? ''] ?? 'bg-gray-50 text-gray-600';
          return (
            <li key={p.id} className="flex items-center justify-between py-3 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate">{p.label}</p>
                  <p className="text-[11px] text-gray-400 truncate">{p.reference}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-right whitespace-nowrap">
                  - {format(p.amount)}{' '}
                  <span className="hidden sm:inline">{p.currency || 'XAF'}</span>
                </span>
                {p.status === 'paid' && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                    Payé
                  </span>
                )}
                {p.status === 'pending' && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
                    En attente
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
