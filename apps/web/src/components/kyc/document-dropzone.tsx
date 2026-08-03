import { useRef, useState, useMemo } from "react";
import { UploadCloud, CheckCircle2, Eye } from "lucide-react";

interface DocumentDropzoneProps {
  label: string;
  hint?: string;
  onFileSelect: (file: File) => void;
  file?: File | null;
}

export function DocumentDropzone({ label, hint, onFileSelect, file }: DocumentDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const isImage = file?.type.startsWith("image/");

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
      window.open(fileUrl, "_blank");
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        dragActive
          ? "border-afrilink-green bg-green-50"
          : file
          ? "border-afrilink-green/50 bg-green-50/40"
          : "border-gray-200 bg-gray-50 hover:border-gray-300"
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
        <div className="mb-3">
          <img
            src={fileUrl}
            alt={file.name}
            className="w-20 h-20 object-cover rounded-lg mx-auto border border-gray-200"
          />
        </div>
      )}

      <div className="w-9 h-9 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
        {file ? (
          <CheckCircle2 className="w-4 h-4 text-afrilink-green" />
        ) : (
          <UploadCloud className="w-4 h-4 text-gray-400" />
        )}
      </div>

      <p className="text-sm font-medium text-gray-700 mb-1">
        {file ? file.name : label}
      </p>
      <p className="text-xs text-gray-400">{hint ?? "PNG, JPG (max 5 Mo)"}</p>

      {file && (
        <button
          onClick={handlePreview}
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-afrilink-green/10 text-afrilink-green text-xs font-medium hover:bg-afrilink-green/20 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Voir le document
        </button>
      )}
    </div>
  );
}
