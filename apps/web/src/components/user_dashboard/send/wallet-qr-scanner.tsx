import { useEffect, useRef, useState } from 'react';
import { X, ScanLine, Camera, AlertCircle } from 'lucide-react';

interface WalletQrScannerProps {
  onClose: () => void;
  onScan: (walletId: string) => void;
}

export function WalletQrScanner({ onClose, onScan }: WalletQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream: MediaStream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès.');
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleSimulateScan = () => {
    setScanning(false);
    onScan('WLT1234567890');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
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
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-white/80 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Scan frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-allness-orange rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-allness-orange rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-allness-orange rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-allness-orange rounded-br-lg" />
                  {scanning && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-allness-orange/60 animate-[scan_2s_ease-in-out_infinite]" />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 space-y-3">
          {scanning && !error && (
            <button
              onClick={handleSimulateScan}
              className="w-full h-11 rounded-xl bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Simuler le scan
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
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
