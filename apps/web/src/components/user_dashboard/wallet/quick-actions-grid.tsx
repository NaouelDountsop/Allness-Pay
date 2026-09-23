import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, QrCode, Smartphone, FileText } from 'lucide-react';

export function QuickActionsGrid() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const quickActions = [
    { label: t('tontines.registerContact'), icon: UserPlus, path: '/dashboard/beneficiaries' },
    { label: t('tontines.scanQR'), icon: QrCode, path: '/dashboard/payments/scan' },
    { label: t('tontines.creditRecharge'), icon: Smartphone, path: '/dashboard/payments' },
    { label: t('tontines.billsServices'), icon: FileText, path: '/dashboard/payments' },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 bg-white dark:bg-gray-800">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('tontines.quickActions')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:border-allness-orange/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-[0.97] transition-all"
          >
            <span className="w-9 h-9 rounded-lg bg-allness-orange/10 flex items-center justify-center text-allness-orange">
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-[11px] text-center text-gray-600 dark:text-gray-400 leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
