import { ArrowLeft } from "lucide-react";

interface KycHeaderProps {
  title: string;
  subtitle?: string;
  progress: number; // 0 à 100
  onBack: () => void;
}

export function KycHeader({ title, subtitle, progress, onBack }: KycHeaderProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark mb-1"
      >
        <ArrowLeft className="w-5 h-5" />
        Compléter mon KYC
      </button>
      <p className="text-sm text-gray-500 mb-4">
        Pour avoir accès à plus de fonctionnalités
      </p>

      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-gradient-to-r from-afrilink-orange to-afrilink-green transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="text-xl font-bold text-afrilink-dark mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}
