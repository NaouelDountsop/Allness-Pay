import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ScanLine } from 'lucide-react';
import { walletService } from '@/lib/api/wallet.service';
import { WalletQrCodeDisplay } from '@/components/user_dashboard/wallet/wallet-qr-code';

interface QrCodePanelProps {
  onScanClick: () => void;
}

export function QrCodePanel({ onScanClick }: QrCodePanelProps) {
  const { t } = useTranslation();

  const { data: primaryWallet } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletService.getPrimary,
  });

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">{t('payments.qrCode.title')}</h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          {t('payments.qrCode.description')}
        </p>
        <button
          onClick={onScanClick}
          className="h-10 px-4 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <ScanLine className="w-5 h-5" />
          {t('payments.qrCode.scanButton')}
        </button>
      </div>
      <div className="shrink-0">
        {primaryWallet ? (
          <WalletQrCodeDisplay
            walletId={primaryWallet.id}
            walletNumber={primaryWallet.walletNumber}
            walletLabel={primaryWallet.label}
          />
        ) : (
          <div className="w-48 h-48 rounded-xl bg-gray-100 flex items-center justify-center">
            <p className="text-xs text-gray-400">Aucun wallet</p>
          </div>
        )}
      </div>
    </div>
  );
}
