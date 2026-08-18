import { useEffect, useRef, useState } from 'react';
import { X, ScanLine } from 'lucide-react';

interface QrScannerModalProps {
  onClose: () => void;
  onScanSuccess: (data: { merchant: string; reference: string; amount: number }) => void;
}

export function QrScannerModal({ onClose, onScanSuccess }: QrScannerModalProps) {
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
        setError("Impossible d'accéder à la caméra. Vérifiez les autorisations.");
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleSimulateScan = () => {
    setScanning(false);
    // Simule la lecture d'un QR code marchand.
    // À remplacer par une vraie librairie de décodage (ex: jsQR) branchée
    // sur les frames vidéo pour une lecture automatique en production.
    onScanSuccess({
      merchant: 'SuperMarket Bafoussam',
      reference: 'CMD123456',
      amount: 15000,
    });
  };

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
          <div className="absolute inset-8 border-2 border-afrilink-orange rounded-xl" />
        </div>
      )}

      <p className="text-white/70 text-sm mt-6 text-center">
        Placez le QR code du marchand dans le cadre
      </p>

      {scanning && !error && (
        <button
          onClick={handleSimulateScan}
          className="mt-6 h-11 px-6 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium flex items-center gap-2"
        >
          <ScanLine className="w-4 h-4" />
          Simuler la lecture (démo)
        </button>
      )}
    </div>
  );
}
