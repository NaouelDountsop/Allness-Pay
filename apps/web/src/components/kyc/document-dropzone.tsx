import { useRef, useState, useMemo } from 'react';
import { UploadCloud, CheckCircle2, Eye, Camera, X, SwitchCamera } from 'lucide-react';

interface DocumentDropzoneProps {
  label: string;
  hint?: string;
  onFileSelect: (file: File) => void;
  file?: File | null;
}

export function DocumentDropzone({ label, hint, onFileSelect, file }: DocumentDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const fileUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const isImage = file?.type.startsWith('image/');

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const switchCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: newMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        });
    }
  };

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onFileSelect(file);
        }
        stopCamera();
      },
      'image/jpeg',
      0.9,
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!fileUrl) return;
    if (isImage) {
      window.open(fileUrl, '_blank');
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <>
      {showCamera && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-black rounded-2xl overflow-hidden">
            <div className="relative aspect-[4/3] bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-6 border-2 border-white/30 rounded-xl pointer-events-none" />
            </div>
            <div className="px-6 pb-6 pt-2">
              <p className="text-center text-white/70 text-xs mb-4">
                Alignez le document dans le cadre
              </p>
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={stopCamera}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={capture}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <div className="w-13 h-13 rounded-full border-4 border-allness-green" />
                </button>
                <button
                  onClick={switchCamera}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <SwitchCamera className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragActive
            ? 'border-allness-green bg-green-50'
            : file
              ? 'border-allness-green/50 bg-green-50/40'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) onFileSelect(selected);
          }}
        />

        {file && isImage && fileUrl && (
          <div className="mb-4">
            <img
              src={fileUrl}
              alt={file.name}
              className="w-full max-h-64 object-contain rounded-lg mx-auto border border-gray-200"
            />
          </div>
        )}

        <div className="w-9 h-9 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
          {file ? (
            <CheckCircle2 className="w-4 h-4 text-allness-green" />
          ) : (
            <UploadCloud className="w-4 h-4 text-gray-400" />
          )}
        </div>

        <p className="text-sm font-medium text-gray-700 mb-1">{file ? file.name : label}</p>
        <p className="text-xs text-gray-400 mb-3">{hint ?? 'PNG, JPG (max 5 Mo)'}</p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              startCamera();
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-allness-orange/10 text-allness-orange text-xs font-medium hover:bg-allness-orange/20 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            Scanner
          </button>
        </div>

        {file && (
          <button
            onClick={handlePreview}
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-allness-green/10 text-allness-green text-xs font-medium hover:bg-allness-green/20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Voir le document
          </button>
        )}
      </div>
    </>
  );
}
