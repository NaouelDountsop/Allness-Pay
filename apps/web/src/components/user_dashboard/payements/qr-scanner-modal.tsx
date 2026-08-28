import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ScanLine, Loader2 } from 'lucide-react';
import jsQR from 'jsqr';
import { walletService } from '@/lib/api/wallet.service';

interface QrScannerModalProps {
  onClose: () => void;
  onScanSuccess: (data: { walletId: string; walletNumber: string; ownerName: string; currency: string }) => void;
}

function extractWalletNumber(qrData: string): string | null {
  const match = qrData.match(/allnesspay:\/\/transfer\?w=(\d+)/);
  return match?.[1] ?? null;
}

export function QrScannerModal({ onClose, onScanSuccess }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [error, setError] = useState('');
  const [resolving, setResolving] = useState(false);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code?.data) {
      const walletNumber = extractWalletNumber(code.data);
      if (walletNumber) {
        setResolving(true);
        walletService.resolveQr(walletNumber)
          .then(onScanSuccess)
          .catch(() => {
            setResolving(false);
            setError('QR Code invalide ou portefeuille introuvable.');
          });
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [onScanSuccess]);

  useEffect(() => {
    let stream: MediaStream | undefined;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            animFrameRef.current = requestAnimationFrame(scanFrame);
          };
        }
      } catch {
        setError('Caméra non disponible. Autorisez l\'accès à la caméra.');
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [scanFrame]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/80 hover:text-white"
        aria-label="Fermer"
      >
        <X className="w-6 h-6" />
      </button>

      {error ? (
        <p className="text-white text-sm text-center max-w-xs">{error}</p>
      ) : (
        <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-gray-900">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-8 border-2 border-allness-orange rounded-xl" />
        </div>
      )}

      <p className="text-white/70 text-sm mt-6 text-center">
        {resolving ? 'Wallet trouvé, vérification...' : 'Placez le QR Code Allness Pay dans le cadre'}
      </p>

      {resolving && (
        <div className="mt-4 flex items-center gap-2 text-white">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Résolution en cours...</span>
        </div>
      )}

      {!error && !resolving && (
        <button
          onClick={onClose}
          className="mt-6 h-11 px-6 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium flex items-center gap-2"
        >
          <ScanLine className="w-4 h-4" />
          Annuler
        </button>
      )}
    </div>
  );
}
