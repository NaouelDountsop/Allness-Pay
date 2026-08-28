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
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-allness-orange/10 flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-allness-orange" />
            </span>
            <div>
              <p className="text-sm font-semibold text-allness-dark">Scanner un wallet</p>
              <p className="text-[11px] text-gray-500">Pointez vers le QR code du destinataire</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Scanner viewport */}
        <div className="relative aspect-square bg-gray-900">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-white/80 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-allness-orange rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-allness-orange rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-allness-orange rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-allness-orange rounded-br-lg" />
                  {!resolving && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-allness-orange/60 animate-[scan_2s_ease-in-out_infinite]" />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 space-y-3">
          {resolving && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-allness-orange" />
              <span className="text-sm text-gray-600">Wallet trouvé, vérification...</span>
            </div>
          )}
          {!error && !resolving && (
            <button
              onClick={onClose}
              className="w-full h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-50%); opacity: 0.4; }
          50% { transform: translateY(50%); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
