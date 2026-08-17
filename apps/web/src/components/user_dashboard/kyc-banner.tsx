import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  type KycBannerStatus,
  kycStatusStyles,
  kycStatusLabels,
} from '@/styles/banners';

interface KycBannerProps {
  status?: KycBannerStatus | null;
}

export function KycBanner({ status }: KycBannerProps) {
  const navigate = useNavigate();

  if (!status) {
    return (
      <div className="mb-4 sm:mb-6 rounded-xl bg-red-200 border border-red-400 text-red-900 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <p className="text-sm leading-snug font-medium">
            Attention ! Complétez votre KYC avant de pouvoir effectuer des transactions
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/kyc')}
          className="group w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-red-700 active:scale-[0.98] transition-all"
        >
          Compléter mon KYC
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    );
  }

  if (status === 'APPROVED') {
    return null;
  }

  return (
    <div
      className={`mb-4 sm:mb-6 rounded-xl border px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${kycStatusStyles[status]}`}
    >
      <p className="text-sm font-medium">{kycStatusLabels[status]}</p>
    </div>
  );
}
