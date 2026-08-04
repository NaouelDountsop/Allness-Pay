import {
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Bell,
  Lightbulb,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type KycStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "REQUIRES_ADDITIONAL_INFO";

interface KycProcessingProps {
  status?: KycStatus;
  reviewComment?: string;
}

const statusContent: Record<
  KycStatus,
  {
    icon: typeof FileText;
    title: string;
    message: string;
    step: string;
  }
> = {
  PENDING: {
    icon: FileText,
    title: "Dossier soumis",
    message:
      "Votre dossier a bien été reçu. Nos équipes le vérifieront dans les plus brefs délais. Cela prend généralement moins de 24 heures.",
    step: "Etape 1/3 — Documents reçus",
  },
  UNDER_REVIEW: {
    icon: Eye,
    title: "Vérification en cours",
    message:
      "Votre dossier est en cours de traitement par nos équipes. Vous recevrez une notification une fois la vérification terminée.",
    step: "Etape 2/3 — En cours de vérification",
  },
  APPROVED: {
    icon: CheckCircle,
    title: "Dossier approuvé",
    message:
      "Félicitations ! Votre identité a été vérifiée. Vous avez maintenant accès à toutes les fonctionnalités d'AfrilinkPay.",
    step: "Etape 3/3 — KYC validé",
  },
  REJECTED: {
    icon: XCircle,
    title: "Dossier refusé",
    message:
      "Votre dossier n'a pas pu être validé. Vous pouvez soumettre un nouveau dossier en corrigeant les points mentionnés ci-dessous.",
    step: "Dossier refusé",
  },
  REQUIRES_ADDITIONAL_INFO: {
    icon: AlertCircle,
    title: "Informations complémentaires",
    message:
      "Nous avons besoin d'informations supplémentaires pour traiter votre dossier. Veuillez le mettre à jour avec les éléments demandés.",
    step: "Informations requises",
  },
};

export function KycProcessing({
  status = "PENDING",
  reviewComment,
}: KycProcessingProps) {
  const navigate = useNavigate();
  const content = statusContent[status];
  const Icon = content.icon;

  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto pt-4">
      <div className="w-full">
        {/* Carte verte indiquant le niveau */}
        <div className="rounded-xl bg-green-50 border border-green-300 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                {content.step}
              </p>
              <p className="text-sm font-bold text-green-900">
                {content.title}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {content.message}
        </p>

        {reviewComment && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-6 text-left">
            <p className="text-xs font-medium text-gray-500 mb-1">
              Commentaire de l&apos;équipe :
            </p>
            <p className="text-sm text-gray-700">{reviewComment}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="rounded-xl bg-afrilink-dark/5 p-3">
            <ShieldCheck className="w-4 h-4 text-afrilink-green mb-1" />
            <p className="text-xs font-medium text-gray-700">Sécurité</p>
            <p className="text-[11px] text-gray-500">
              Vos données sont chiffrées selon les standards bancaires.
            </p>
          </div>
          <div className="rounded-xl bg-afrilink-dark/5 p-3">
            <Bell className="w-4 h-4 text-afrilink-green mb-1" />
            <p className="text-xs font-medium text-gray-700">Notification</p>
            <p className="text-[11px] text-gray-500">
              Vous recevrez un e-mail dès que votre dossier sera traité.
            </p>
          </div>
        </div>

        {(status === "REJECTED" || status === "REQUIRES_ADDITIONAL_INFO") && (
          <button
            onClick={() => navigate("/dashboard/kyc")}
            className="w-full h-11 rounded-lg bg-afrilink-orange hover:bg-afrilink-orangeHover text-white text-sm font-medium transition-colors mb-3 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {status === "REJECTED"
              ? "Soumettre un nouveau dossier"
              : "Mettre à jour le dossier"}
          </button>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors mb-3"
        >
          Retour au Tableau de Bord
        </button>
        <a href="/support" className="text-sm text-afrilink-green font-medium">
          Contacter le support
        </a>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-afrilink-green/5 border border-afrilink-green/10 p-4 mt-4 w-full text-left">
        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-afrilink-green" />
        <div>
          <p className="text-xs font-medium text-afrilink-dark">Le saviez-vous ?</p>
          <p className="text-xs text-gray-500">
            {status === "APPROVED"
              ? "Vous pouvez maintenant effectuer des virements et gérer votre portefeuille."
              : "Vous pouvez déjà explorer nos guides de gestion de patrimoine en attendant la validation."}
          </p>
        </div>
      </div>
    </div>
  );
}
