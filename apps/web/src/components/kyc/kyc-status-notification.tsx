import { FileText, ShieldCheck } from 'lucide-react';
import {
  type KycBannerStatus,
  kycNotificationStyles,
  kycNotificationTitles,
  kycNotificationMessages,
  kycNotificationBannerStyles,
  kycNotificationBannerMessages,
} from '@/styles/banners';

interface KycStatusNotificationProps {
  status: KycBannerStatus;
  reviewComment?: string;
  createdAt?: string;
  verifiedAt?: string;
}

export function KycStatusNotification({
  status,
  reviewComment,
  createdAt,
  verifiedAt,
}: KycStatusNotificationProps) {
  const config = kycNotificationStyles[status];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-4 sm:p-5`}>
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${config.color} mb-1`}>
            {kycNotificationTitles[status]}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {kycNotificationMessages[status]}
          </p>

          {reviewComment && (
            <div className="mt-3 p-3 rounded-lg bg-white/60 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">Commentaire :</p>
              <p className="text-sm text-gray-700">{reviewComment}</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
            {createdAt && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Soumis le{' '}
                {new Date(createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
            {verifiedAt && (
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Traité le{' '}
                {new Date(verifiedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
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
  status: KycBannerStatus;
  onAction?: () => void;
}

export function KycNotificationBanner({ status, onAction }: KycNotificationBannerProps) {
  const config = kycNotificationBannerStyles[status];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border ${config.borderColor} ${config.bgColor} px-4 py-3`}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} shrink-0`} />
      <p className={`text-sm font-medium ${config.textColor} flex-1`}>
        {kycNotificationBannerMessages[status]}
      </p>
      {config.buttonBg && onAction && (
        <button
          onClick={onAction}
          className={`shrink-0 px-4 py-2 rounded-lg text-white text-xs font-semibold ${config.buttonBg} ${config.buttonHover} transition-colors`}
        >
          {status === 'REJECTED' ? 'Soumettre un nouveau dossier' : 'Mettre à jour le dossier'}
        </button>
      )}
    </div>
  );
}
