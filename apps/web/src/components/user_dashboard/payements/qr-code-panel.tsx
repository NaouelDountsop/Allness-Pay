import { useTranslation } from 'react-i18next';
import { QrCode, ScanLine } from 'lucide-react';

interface QrCodePanelProps {
  onScanClick: () => void;
}

export function QrCodePanel({ onScanClick }: QrCodePanelProps) {
  const { t } = useTranslation();
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
      <div className="w-28 h-28 rounded-xl bg-allness-dark flex items-center justify-center shrink-0">
        <QrCode className="w-14 h-14 text-white/80" />
      </div>
    </div>
  );
}
