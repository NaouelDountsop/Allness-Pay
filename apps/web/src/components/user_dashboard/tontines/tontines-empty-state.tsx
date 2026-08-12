import { PiggyBank, ShieldCheck, Target, Plus } from 'lucide-react';

interface TontinesEmptyStateProps {
  onCreate: () => void;
  onJoin: () => void;
}

const benefits = [
  {
    icon: PiggyBank,
    title: 'Épargnez ensemble',
    description: "Mettez de l'argent de côté régulièrement et atteignez vos objectifs plus vite.",
  },
  {
    icon: ShieldCheck,
    title: 'Sécurisé et fiable',
    description: 'Vos fonds sont protégés et la gestion est transparente.',
  },
  {
    icon: Target,
    title: 'Réalisez vos projets',
    description: 'Financez vos projets personnels, familiaux ou professionnels en toute sérénité.',
  },
];

export function TontinesEmptyState({ onCreate, onJoin }: TontinesEmptyStateProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="flex items-end justify-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
          <PiggyBank className="w-8 h-8 text-afrilink-orange" />
        </div>
        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
          <PiggyBank className="w-12 h-12 text-afrilink-green" />
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-afrilink-dark mb-2">Aucune tontine active</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Vous n'avez pas encore rejoint ou créé de tontine. Lancez-vous et atteignez vos objectifs
          financiers ensemble !
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl bg-afrilink-dark p-4 text-left">
              <Icon className="w-5 h-5 text-afrilink-orange mb-2" />
              <p className="text-xs font-semibold text-white mb-1">{title}</p>
              <p className="text-[11px] text-white/60 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCreate}
            className="flex-1 h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Créer une tontine</span>
          </button>
          <button
            onClick={onJoin}
            className="flex-1 h-11 rounded-lg border border-afrilink-green text-afrilink-green text-sm font-medium hover:bg-green-50 transition-colors"
          >
            Rejoindre une tontine
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white border border-gray-100 p-4 mt-4 text-left">
        <p className="text-xs text-gray-500">
          Besoin d'aide sur les tontines ? Consultez notre guide complet pour comprendre le
          fonctionnement des tontines.
        </p>

        <a
          href="/help/tontines"
          className="shrink-0 ml-4 h-9 px-4 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center"
        >
          Voir le guide
        </a>
      </div>
    </div>
  );
}
