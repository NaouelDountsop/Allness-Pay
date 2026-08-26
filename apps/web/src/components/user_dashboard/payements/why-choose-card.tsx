import { useTranslation } from 'react-i18next';
import { Zap, ShieldCheck, Globe } from 'lucide-react';

export function WhyChooseCard() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-allness-dark text-white p-5">
      <h3 className="text-sm font-semibold mb-4">{t('payments.whyChoose.title')}</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Zap className="w-4 h-4 text-allness-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">{t('payments.whyChoose.speed')}</p>
            <p className="text-[11px] text-white/60">
              {t('payments.whyChoose.speedDescription')}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-allness-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">{t('payments.whyChoose.security')}</p>
            <p className="text-[11px] text-white/60">
              {t('payments.whyChoose.securityDescription')}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Globe className="w-4 h-4 text-allness-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">{t('payments.whyChoose.network')}</p>
            <p className="text-[11px] text-white/60">
              {t('payments.whyChoose.networkDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
