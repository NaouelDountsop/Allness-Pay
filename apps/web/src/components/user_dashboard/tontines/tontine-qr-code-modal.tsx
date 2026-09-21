import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2, Download } from 'lucide-react';
import { tontineService } from '@/lib/api/tontine.service';

interface TontineQrCodeInlineProps {
  tontineId: string;
  tontineName: string;
}

async function generateQrWithLogo(data: string): Promise<string> {
  const size = 512;
  const margin = 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas non supporté');

  await QRCode.toCanvas(canvas, data, {
    width: size,
    margin,
    color: { dark: '#000000', light: '#ffffff' },
  });

  try {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      logo.onload = () => resolve();
      logo.onerror = reject;
      logo.src = '/allnesspay_logo2.png';
    });

    const logoSize = size * 0.22;
    const x = (size - logoSize) / 2;
    const y = (size - logoSize) / 2;
    const padding = 4;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2);
    ctx.drawImage(logo, x, y, logoSize, logoSize);
  } catch {
    // Logo introuvable, on garde le QR sans logo
  }

  return canvas.toDataURL('image/png');
}

export function TontineQrCodeInline({ tontineId, tontineName }: TontineQrCodeInlineProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cycleNumber, setCycleNumber] = useState(0);
  const [expectedAmount, setExpectedAmount] = useState('');
  const [currency, setCurrency] = useState('');

  useEffect(() => {
    let cancelled = false;

    const generateQr = async () => {
      try {
        setLoading(true);
        const data = await tontineService.getQrCodeData(tontineId);
        const dataUrl = await generateQrWithLogo(data.deepLink);
        if (!cancelled) {
          setQrImage(dataUrl);
          setCycleNumber(data.cycleNumber);
          setExpectedAmount(data.expectedAmount);
          setCurrency(data.currency);
        }
      } catch {
        if (!cancelled) {
          setError('Impossible de générer le QR Code.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    generateQr();
    return () => { cancelled = true; };
  }, [tontineId]);

  const handleDownload = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.download = `qr-tontine-${tontineName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = qrImage;
    link.click();
  };

  const formatAmount = (amount: string): string => {
    return new Intl.NumberFormat('fr-FR').format(Number(amount));
  };

  const currencyLabels: Record<string, string> = {
    XAF: 'FCFA',
    XOF: 'CFA',
    CAD: 'CA$',
    EUR: '€',
    USD: '$',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-allness-green animate-spin" />
        <p className="text-sm text-gray-500 mt-2">Génération du QR Code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {qrImage && <img src={qrImage} alt="QR Code Tontine" className="w-72 h-72" />}
      </div>

      <p className="text-sm font-semibold text-allness-dark mt-3">{tontineName}</p>
      <p className="text-xs text-gray-500 mt-1">
        Cycle {cycleNumber} · {formatAmount(expectedAmount)} {currencyLabels[currency] ?? currency}
      </p>

      <p className="text-[11px] text-gray-400 mt-3 text-center">
        Les membres scannent ce QR pour cotiser directement
      </p>

      <button
        onClick={handleDownload}
        className="mt-4 h-9 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Sauvegarder
      </button>
    </div>
  );
}
