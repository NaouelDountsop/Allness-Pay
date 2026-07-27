import { useEffect, useRef, useState } from "react";
import { Camera, CircleCheck } from "lucide-react";

interface KycFacialStepProps {
  onNext: () => void;
}

const instructions = [
  "Assurez-vous d'être dans un endroit bien éclairé.",
  "Retirez vos lunettes, votre chapeau ou tout masque.",
  "Gardez votre visage au centre du cercle et restez immobile.",
  "Vos données biométriques sont chiffrées et ne sont jamais partagées avec des tiers.",
];

export function KycFacialStep({ onNext }: KycFacialStepProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setError("");
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError("Impossible d'accéder à la caméra. Vérifiez les autorisations.");
    }
  };

  const handleCapture = async () => {
    if (!stream) {
      await startCamera();
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      setCaptured(true);
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setTimeout(onNext, 800);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-afrilink-dark mb-1">
        Vérification Faciale
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Pour sécuriser votre compte, nous devons confirmer votre identité par un
        selfie biométrique.
      </p>

      <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-6 flex flex-col sm:flex-row items-center gap-8">
        <div className="w-full sm:w-40 h-40 rounded-3xl border-4 border-dashed border-blue-200 flex items-center justify-center relative shrink-0 bg-black overflow-hidden">
          {captured ? (
            <CircleCheck className="w-10 h-10 text-afrilink-green" />
          ) : stream ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <p className="text-xs text-gray-400 px-4 text-center">
              Centrer le visage
            </p>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 mb-3">Instructions</p>
          <ul className="space-y-2">
            {instructions.map((text) => (
              <li key={text} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-afrilink-green mt-1.5 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error ? <p className="text-sm text-red-500 mt-4">{error}</p> : null}
      <button
        onClick={handleCapture}
        className="mt-6 h-11 px-6 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium flex items-center gap-2 transition-colors"
      >
        <Camera className="w-4 h-4" />
        {stream ? "Prendre un selfie" : captured ? "Selfie pris" : "Prendre un selfie"}
      </button>
    </div>
  );
}
