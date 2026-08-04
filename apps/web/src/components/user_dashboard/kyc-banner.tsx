import { AlertTriangle, ArrowUpRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { KycStatus } from "@afrilinkpay/shared";

interface KycBannerProps {
  status?: KycStatus | null;
}

export function KycBanner({ status }: KycBannerProps) {
  if (status === "PENDING") {
    return (
      <div className="mx-4 sm:mx-8 mb-6 rounded-xl bg-green-50 border border-green-300 text-green-900 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Clock className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0 text-green-600" />
          <p className="text-sm leading-snug font-medium">
            Votre dossier KYC a été soumis. Nous l'examinons dans les plus brefs délais.
          </p>
        </div>
        <span className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-5 py-2.5 rounded-full">
          En attente de validation
        </span>
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <div className="mx-4 sm:mx-8 mb-6 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0 text-emerald-600" />
          <p className="text-sm leading-snug font-medium">
            Votre identité est vérifiée. Vous pouvez effectuer des transactions.
          </p>
        </div>
        <span className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-semibold px-5 py-2.5 rounded-full">
          KYC vérifié
        </span>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="mx-4 sm:mx-8 mb-6 rounded-xl bg-orange-50 border border-orange-300 text-orange-900 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0 text-orange-600" />
          <p className="text-sm leading-snug font-medium">
            Votre dossier KYC a été refusé. Veuillez le soumettre à nouveau.
          </p>
        </div>
        <Link
          to="/dashboard/kyc"
          className="group w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-orange-700 active:scale-[0.98] transition-all"
        >
          Resoumettre mon KYC
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-4 sm:mx-8 mb-6 rounded-xl bg-red-200 border border-red-400 text-red-900 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-start sm:items-center gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0 text-red-600" />
        <p className="text-sm leading-snug font-medium">
          Attention ! Complétez votre KYC avant de pouvoir effectuer des transactions
        </p>
      </div>
      <Link
        to="/dashboard/kyc"
        className="group w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-red-700 active:scale-[0.98] transition-all"
      >
        Compléter mon KYC
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  );
}
