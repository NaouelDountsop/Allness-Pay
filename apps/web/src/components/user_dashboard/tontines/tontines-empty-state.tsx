import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PiggyBank, ShieldCheck, Target, Plus } from 'lucide-react';

interface TontinesEmptyStateProps {
  onCreate: () => void;
  onJoin: () => void;
}
export function TontinesEmptyState({ onCreate }: TontinesEmptyStateProps) {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const benefits = [
      { icon: PiggyBank, title: t('tontines.saveTogether'), description: t('tontines.saveTogetherDesc') },
      { icon: ShieldCheck, title: t('tontines.secureAndReliable'), description: t('tontines.secureAndReliableDesc') },
      { icon: Target, title: t('tontines.achieveYourProjects'), description: t('tontines.achieveYourProjectsDesc') },
    ];

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="flex items-end justify-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
          <PiggyBank className="w-8 h-8 text-allness-orange" />
        </div>
        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
          <PiggyBank className="w-12 h-12 text-allness-green" />
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-allness-dark mb-2">{t('tontines.noActiveTontine')}</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          {t('tontines.emptyDescription')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl bg-allness-dark p-4 text-left">
              <Icon className="w-5 h-5 text-allness-orange mb-2" />
              <p className="text-xs font-semibold text-white mb-1">{title}</p>
              <p className="text-[11px] text-white/70 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCreate}
            className="flex-1 h-11 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('tontines.createTontine')}
          </button>
          <button
            onClick={() => navigate('/dashboard/tontines/invitations')}
            className="flex-1 h-11 rounded-lg border border-allness-green text-allness-green text-sm font-medium hover:bg-green-50 transition-colors"
          >
            {t('tontines.joinTontine')}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white border border-gray-100 p-4 mt-4 text-left">
        <p className="text-xs text-gray-600">
          {t('tontines.needHelp')}
        </p>

        <a
          href="/help/tontines"
          className="shrink-0 ml-4 h-9 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center"
        >
          {t('tontines.viewGuide')}
        </a>
      </div>
    </div>
  );
}
