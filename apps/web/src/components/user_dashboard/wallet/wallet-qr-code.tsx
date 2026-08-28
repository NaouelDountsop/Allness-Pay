import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2, Download } from 'lucide-react';
import { walletService } from '@/lib/api/wallet.service';

interface WalletQrCodeDisplayProps {
  walletId: string;
  walletNumber: string;
  walletLabel?: string;
}

async function generateQrWithLogo(data: string): Promise<string> {
  const size = 256;
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

export function WalletQrCodeDisplay({ walletId, walletNumber, walletLabel }: WalletQrCodeDisplayProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const generateQr = async () => {
      try {
        setLoading(true);
        const data = await walletService.getQrCode(walletId);
        const dataUrl = await generateQrWithLogo(data.qrCodeData);
        if (!cancelled) {
          setQrImage(dataUrl);
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
  }, [walletId]);

  const handleDownload = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.download = `qr-${walletNumber}.png`;
    link.href = qrImage;
    link.click();
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
      <div className="text-center py-8">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        {qrImage && <img src={qrImage} alt="QR Code Wallet" className="w-48 h-48" />}
      </div>
      <p className="text-sm font-semibold text-allness-dark mt-3">{walletLabel ?? walletNumber}</p>
      
      <button
        onClick={handleDownload}
        className="mt-3 h-9 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Sauvegarder
      </button>
    </div>
  );
}
