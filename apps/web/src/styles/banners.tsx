import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

export type BannerVariant = 'error' | 'success' | 'warning' | 'info';

export type KycBannerStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REQUIRES_ADDITIONAL_INFO';

export interface BannerStyle {
  bg: string;
  border: string;
  text: string;
  icon: ReactNode;
}

export type KycBannerStyle = string;

export interface KycNotificationStyle {
  icon: typeof AlertCircle;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
}

export interface KycNotificationBannerStyle {
  icon: typeof AlertCircle;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  buttonBg: string;
  buttonHover: string;
}

export const alertVariantStyles: Record<BannerVariant, BannerStyle> = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-900',
    icon: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-900',
    icon: <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />,
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    text: 'text-orange-900',
    icon: <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />,
  },
  info: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    text: 'text-orange-900',
    icon: <Info className="w-5 h-5 text-orange-500 shrink-0" />,
  },
};

export const kycStatusStyles: Record<KycBannerStatus, KycBannerStyle> = {
  PENDING: 'bg-orange-50 border-orange-300 text-orange-900',
  UNDER_REVIEW: 'bg-orange-50 border-orange-300 text-orange-900',
  APPROVED: 'bg-green-50 border-green-300 text-green-900',
  REJECTED: 'bg-red-50 border-red-300 text-red-900',
  REQUIRES_ADDITIONAL_INFO: 'bg-orange-50 border-orange-300 text-orange-900',
};

export const kycStatusLabels: Record<KycBannerStatus, string> = {
  PENDING: 'Votre dossier KYC est en cours de traitement. Etape 1/3 — Documents soumis.',
  UNDER_REVIEW:
    "Votre dossier KYC est en cours de vérification. Etape 2/3 — En cours d'examen.",
  APPROVED:
    'Votre KYC est validé. Etape 3/3 — Vous pouvez effectuer des transactions.',
  REJECTED:
    'Votre dossier KYC a été refusé. Vous pouvez soumettre un nouveau dossier.',
  REQUIRES_ADDITIONAL_INFO:
    'Votre dossier KYC nécessite des informations complémentaires.',
};

export const kycNotificationStyles: Record<KycBannerStatus, KycNotificationStyle> = {
  PENDING: {
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    color: 'text-orange-700',
    iconBg: 'bg-orange-100',
  },
  UNDER_REVIEW: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    color: 'text-amber-700',
    iconBg: 'bg-amber-100',
  },
  APPROVED: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    color: 'text-green-700',
    iconBg: 'bg-green-100',
  },
  REJECTED: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    color: 'text-red-700',
    iconBg: 'bg-red-100',
  },
  REQUIRES_ADDITIONAL_INFO: {
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    color: 'text-orange-700',
    iconBg: 'bg-orange-100',
  },
};

export const kycNotificationTitles: Record<KycBannerStatus, string> = {
  PENDING: 'Dossier soumis',
  UNDER_REVIEW: 'En cours de vérification',
  APPROVED: 'Dossier approuvé',
  REJECTED: 'Dossier refusé',
  REQUIRES_ADDITIONAL_INFO: 'Informations complémentaires requises',
};

export const kycNotificationMessages: Record<KycBannerStatus, string> = {
  PENDING:
    'Votre dossier a bien été reçu. Il sera examiné prochainement par nos équipes.',
  UNDER_REVIEW:
    "Nos équipes analysent actuellement vos documents. Vous recevrez une notification une fois la vérification terminée.",
  APPROVED:
    "Félicitations ! Votre identité a été vérifiée. Vous avez maintenant accès à toutes les fonctionnalités.",
  REJECTED:
    "Votre dossier n'a pas pu être validé. Vous pouvez soumettre un nouveau dossier en corrigeant les points mentionnés.",
  REQUIRES_ADDITIONAL_INFO:
    "Nous avons besoin d'informations supplémentaires pour traiter votre dossier. Veuillez le mettre à jour.",
};

export const kycNotificationBannerStyles: Record<
  KycBannerStatus,
  KycNotificationBannerStyle
> = {
  PENDING: {
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-500',
    buttonBg: 'bg-orange-500',
    buttonHover: 'hover:bg-orange-600',
  },
  UNDER_REVIEW: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-500',
    buttonBg: 'bg-amber-500',
    buttonHover: 'hover:bg-amber-600',
  },
  APPROVED: {
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
    buttonBg: 'bg-green-500',
    buttonHover: 'hover:bg-green-600',
  },
  REJECTED: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    buttonBg: 'bg-red-500',
    buttonHover: 'hover:bg-red-600',
  },
  REQUIRES_ADDITIONAL_INFO: {
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-500',
    buttonBg: 'bg-orange-500',
    buttonHover: 'hover:bg-orange-600',
  },
};

export const kycNotificationBannerMessages: Record<KycBannerStatus, string> = {
  PENDING: 'Votre dossier KYC est en attente de vérification.',
  UNDER_REVIEW: "Votre dossier KYC est en cours d'examen par nos équipes.",
  APPROVED:
    'Votre KYC a été approuvé ! Vous avez accès à toutes les fonctionnalités.',
  REJECTED:
    'Votre dossier KYC a été refusé. Vous pouvez soumettre un nouveau dossier.',
  REQUIRES_ADDITIONAL_INFO:
    'Des informations supplémentaires sont nécessaires pour votre dossier KYC.',
};

export const tontineBannerStyle = {
  wrapper:
    'mb-4 sm:mb-6 rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:via-yellow-900/20 dark:to-yellow-950/30 border border-amber-300/50 dark:border-yellow-700/30 px-4 py-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4',
  iconWrapper:
    'w-9 h-9 rounded-lg bg-amber-100 dark:bg-yellow-900/40 flex items-center justify-center shrink-0',
  iconColor: 'text-amber-600 dark:text-yellow-400',
  textColor: 'text-amber-900 dark:text-yellow-200',
  button:
    'group w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-amber-500 dark:bg-yellow-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-amber-600 dark:hover:bg-yellow-500 active:scale-[0.98] transition-all',
};

export const scheduledPaymentsBannerStyle = {
  wrapper:
    'rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-4',
  iconWrapper:
    'w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0',
  iconColor: 'text-blue-600',
  titleColor: 'text-gray-800',
  descriptionColor: 'text-gray-500',
  linkColor: 'text-allness-green',
};
