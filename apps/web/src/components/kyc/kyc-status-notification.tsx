import {
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";

type KycStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "REQUIRES_ADDITIONAL_INFO";

interface KycStatusNotificationProps {
  status: KycStatus;
  reviewComment?: string;
  createdAt?: string;
  verifiedAt?: string;
}

const statusConfig: Record<
  KycStatus,
  {
    icon: typeof Clock;
    title: string;
    message: string;
    color: string;
    bgColor: string;
    borderColor: string;
    iconBg: string;
  }
> = {
  PENDING: {
    icon: Clock,
    title: "Dossier soumis",
    message:
      "Votre dossier a bien été reçu. Il sera examiné prochainement par nos équipes.",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
  },
  UNDER_REVIEW: {
    icon: Eye,
    title: "En cours de vérification",
    message:
      "Nos équipes analysent actuellement vos documents. Vous recevrez une notification une fois la vérification terminée.",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconBg: "bg-amber-100",
  },
  APPROVED: {
    icon: CheckCircle,
    title: "Dossier approuvé",
    message:
      "Félicitations ! Votre identité a été vérifiée. Vous avez maintenant accès à toutes les fonctionnalités.",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconBg: "bg-green-100",
  },
  REJECTED: {
    icon: XCircle,
    title: "Dossier refusé",
    message:
      "Votre dossier n'a pas pu être validé. Vous pouvez soumettre un nouveau dossier en corrigeant les points mentionnés.",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconBg: "bg-red-100",
  },
  REQUIRES_ADDITIONAL_INFO: {
    icon: AlertCircle,
    title: "Informations complémentaires requises",
    message:
      "Nous avons besoin d'informations supplémentaires pour traiter votre dossier. Veuillez le mettre à jour.",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconBg: "bg-orange-100",
  },
};

export function KycStatusNotification({
  status,
  reviewComment,
  createdAt,
  verifiedAt,
}: KycStatusNotificationProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-4 sm:p-5`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${config.color} mb-1`}>
            {config.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{config.message}</p>

          {reviewComment && (
            <div className="mt-3 p-3 rounded-lg bg-white/60 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Commentaire :
              </p>
              <p className="text-sm text-gray-700">{reviewComment}</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
            {createdAt && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Soumis le{" "}
                {new Date(createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {verifiedAt && (
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Traité le{" "}
                {new Date(verifiedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface KycNotificationBannerProps {
  status: KycStatus;
  onAction?: () => void;
}

export function KycNotificationBanner({
  status,
  onAction,
}: KycNotificationBannerProps) {
  const bannerConfig: Record<
    KycStatus,
    {
      icon: typeof Clock;
      message: string;
      actionLabel?: string;
      bgColor: string;
      borderColor: string;
      textColor: string;
      iconColor: string;
      buttonBg: string;
      buttonHover: string;
    }
  > = {
    PENDING: {
      icon: Clock,
      message: "Votre dossier KYC est en attente de vérification.",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-500",
      buttonBg: "bg-blue-500",
      buttonHover: "hover:bg-blue-600",
    },
    UNDER_REVIEW: {
      icon: Eye,
      message: "Votre dossier KYC est en cours d'examen par nos équipes.",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-800",
      iconColor: "text-amber-500",
      buttonBg: "bg-amber-500",
      buttonHover: "hover:bg-amber-600",
    },
    APPROVED: {
      icon: CheckCircle,
      message: "Votre KYC a été approuvé ! Vous avez accès à toutes les fonctionnalités.",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-500",
      buttonBg: "bg-green-500",
      buttonHover: "hover:bg-green-600",
    },
    REJECTED: {
      icon: XCircle,
      message: "Votre dossier KYC a été refusé. Vous pouvez soumettre un nouveau dossier.",
      actionLabel: "Soumettre un nouveau dossier",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-500",
      buttonBg: "bg-red-500",
      buttonHover: "hover:bg-red-600",
    },
    REQUIRES_ADDITIONAL_INFO: {
      icon: AlertCircle,
      message: "Des informations supplémentaires sont nécessaires pour votre dossier KYC.",
      actionLabel: "Mettre à jour le dossier",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      iconColor: "text-orange-500",
      buttonBg: "bg-orange-500",
      buttonHover: "hover:bg-orange-600",
    },
  };

  const config = bannerConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border ${config.borderColor} ${config.bgColor} px-4 py-3`}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} shrink-0`} />
      <p className={`text-sm font-medium ${config.textColor} flex-1`}>
        {config.message}
      </p>
      {config.actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`shrink-0 px-4 py-2 rounded-lg text-white text-xs font-semibold ${config.buttonBg} ${config.buttonHover} transition-colors`}
        >
          {config.actionLabel}
        </button>
      )}
    </div>
  );
}
