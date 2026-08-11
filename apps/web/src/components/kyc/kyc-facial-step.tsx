import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Check } from "lucide-react";

interface KycFacialStepProps {
  onNext: (selfie: File) => void;
}

export function KycFacialStep({ onNext }: KycFacialStepProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setError("");
      streamRef.current = mediaStream;
      setStream(mediaStream);
    } catch {
      setError("Impossible d'accéder à la caméra. Vérifiez les autorisations.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    if (!captured) {
      startCamera();
    }
  }, [captured]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!stream || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9),
    );
    const file = new File([blob], `selfie-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    const url = URL.createObjectURL(blob);
    setCapturedUrl(url);
    setCapturedFile(file);
    setCaptured(true);
    stopCamera();
  };

  const handleRetake = () => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCapturedFile(null);
    setCaptured(false);
  };

  const handleConfirm = () => {
    if (capturedFile) onNext(capturedFile);
  };

  return (
    <div>
      <div className="rounded-2xl bg-afrilink-dark/5 border border-afrilink-dark/10 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Caméra live */}
          <div className="w-full max-w-xs aspect-square rounded-3xl border-4 border-dashed border-afrilink-dark/20 flex items-center justify-center relative overflow-hidden bg-black shrink-0">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${captured ? "hidden" : ""}`}
              autoPlay
              playsInline
              muted
            />
            {!captured && !stream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400 px-4 text-center mt-2">
                  Démarrage de la caméra...
                </p>
              </div>
            )}
            {!captured && (
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="text-[10px] text-white/60 bg-black/40 px-2 py-1 rounded-full">
                  Caméra live
                </span>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Photo capturée */}
          <div className="w-full max-w-xs aspect-square rounded-3xl border-4 border-dashed border-afrilink-dark/20 flex items-center justify-center relative overflow-hidden bg-gray-100 shrink-0">
            {captured && capturedUrl ? (
              <>
                <img src={capturedUrl} alt="Selfie capturé" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-[10px] text-white/80 bg-black/40 px-2 py-1 rounded-full">
                    Photo prise
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 text-gray-300" />
                <p className="text-xs text-gray-400 px-4 text-center">
                  Votre visage apparaîtra ici
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-500 mt-4">{error}</p> : null}

      <div className="flex items-center gap-3 mt-6">
        {captured ? (
          <>
            <button
              onClick={handleRetake}
              className="h-11 px-5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reprendre
            </button>
            <button
              onClick={handleConfirm}
              className="h-11 px-6 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              Confirmer
            </button>
          </>
        ) : (
          <button
            onClick={handleCapture}
            disabled={!stream}
            className="h-11 px-6 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4" />
            Prendre un selfie
          </button>
        )}
      </div>
    </div>
  );
}
