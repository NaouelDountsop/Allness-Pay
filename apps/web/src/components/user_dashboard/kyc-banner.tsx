import { AlertTriangle } from "lucide-react";

export function KycBanner() {
  return (
    <div className="mx-4 sm:mx-8 mb-6 rounded-xl bg-red-600 text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <p className="text-sm font-medium">
          Attention ! Complétez votre KYC avant de pouvoir effectuer des transactions
        </p>
      </div>
      <a
        href="/dashboard/kyc"
        className="shrink-0 bg-white text-red-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
      >
        Compléter mon KYC
      </a>
    </div>
  );
}
