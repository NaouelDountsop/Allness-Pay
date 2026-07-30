import { AlertTriangle, ArrowUpRight } from "lucide-react";

export function KycBanner() {
  return (
    <div className="mx-4 sm:mx-8 mb-6 rounded-xl bg-red-200 border border-red-400 text-red-900 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-start sm:items-center gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0 text-red-600" />
        <p className="text-sm leading-snug font-medium">
          Attention ! Complétez votre KYC avant de pouvoir effectuer des transactions
        </p>
      </div>
      <a
        href="/dashboard/kyc"
        className="group w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-red-700 active:scale-[0.98] transition-all"
      >
        Compléter mon KYC
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </div>
  );
}