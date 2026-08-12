import { QrCode, ScanLine } from 'lucide-react';

interface QrCodePanelProps {
  onScanClick: () => void;
}

export function QrCodePanel({ onScanClick }: QrCodePanelProps) {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Paiement par QR Code</h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Payez instantanément chez vos marchands en votre présence en scannant leur code QR. C'est
          rapide, sécurisé et sans contact.
        </p>
        <button
          onClick={onScanClick}
          className="h-10 px-4 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <ScanLine className="w-4 h-4" />
          Scanner un QR Code
        </button>
      </div>
      <div className="w-28 h-28 rounded-xl bg-afrilink-dark flex items-center justify-center shrink-0">
        <QrCode className="w-14 h-14 text-white/80" />
      </div>
    </div>
  );
}
