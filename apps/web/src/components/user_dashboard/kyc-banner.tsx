import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type KycStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "REQUIRES_ADDITIONAL_INFO"
  | null;

interface KycBannerProps {
  status?: KycStatus;
}

const statusLabel: Record<NonNullable<KycStatus>, string> = {
  PENDING: "Votre dossier KYC est en cours de traitement. Etape 1/3 — Documents soumis.",
  UNDER_REVIEW: "Votre dossier KYC est en cours de vérification. Etape 2/3 — En cours d'examen.",
  APPROVED: "Votre KYC est validé. Etape 3/3 — Vous pouvez effectuer des transactions.",
  REJECTED: "Votre dossier KYC a été refusé. Vous pouvez soumettre un nouveau dossier.",
  REQUIRES_ADDITIONAL_INFO: "Votre dossier KYC nécessite des informations complémentaires.",
};

const statusStyles: Record<NonNullable<KycStatus>, string> = {
  PENDING: "bg-orange-50 border-orange-300 text-orange-900",
  UNDER_REVIEW: "bg-blue-50 border-blue-300 text-blue-900",
  APPROVED: "bg-green-50 border-green-300 text-green-900",
  REJECTED: "bg-red-50 border-red-300 text-red-900",
  REQUIRES_ADDITIONAL_INFO: "bg-orange-50 border-orange-300 text-orange-900",
};

export function KycBanner({ status }: KycBannerProps) {
  const navigate = useNavigate();

  if (!status) {
    return (
      <div className="mb-4 sm:mb-6 rounded-xl bg-red-200 border border-red-400 text-red-900 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <p className="text-sm leading-snug font-medium">
            Attention ! Complétez votre KYC avant de pouvoir effectuer des transactions
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/kyc")}
          className="group w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-red-700 active:scale-[0.98] transition-all"
        >
          Compléter mon KYC
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    );
  }

  if (status === "APPROVED") {
    return null;
  }

  return (
    <div
      className={`mb-4 sm:mb-6 rounded-xl border px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${statusStyles[status]}`}
    >
      <p className="text-sm font-medium">{statusLabel[status]}</p>
    </div>
  );
}