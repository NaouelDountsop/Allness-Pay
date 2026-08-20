import { IdCard, ScanFace, Home } from 'lucide-react';

interface KycIntroProps {
  onStart: () => void;
  onLater: () => void;
}

const requirements = [
  {
    icon: IdCard,
    title: "Pièce d'identité valide",
    description: "Passeport ou carte nationale d'identité en cours de validité.",
  },
  {
    icon: ScanFace,
    title: 'Selfie clair',
    description: "Une photo de votre visage pour confirmer que c'est bien vous.",
  },
  {
    icon: Home,
    title: 'Justificatif de domicile',
    description: 'Facture de services publics ou relevé bancaire récent (< 3 mois).',
  },
];

export function KycIntro({ onStart, onLater }: KycIntroProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-allness-dark mb-3">Vérification d'identité</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Pour garantir la sécurité de vos fonds et respecter les réglementations bancaires
          internationales (KYC), nous devons confirmer votre identité. Ce processus est rapide et
          entièrement sécurisé.
        </p>

        <p className="text-sm font-semibold text-allness-dark mb-3">Éléments requis :</p>

        <div className="space-y-3 mb-8">
          {requirements.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-xl border border-gray-100 p-4"
            >
              <div className="w-9 h-9 rounded-lg bg-allness-green/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-allness-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onStart}
            className="h-11 px-6 rounded-lg bg-allness-green hover:bg-allness-greenHover text-white text-sm font-medium transition-colors"
          >
            Commencer la vérification →
          </button>
          <button
            onClick={onLater}
            className="h-11 px-6 rounded-lg border border-allness-orange text-allness-orange text-sm font-medium hover:bg-orange-50 transition-colors"
          >
            Plus tard
          </button>
        </div>
      </div>

      <div className="hidden lg:flex w-96 shrink-0 items-center justify-center">
        <img src="/Upload-pana.svg" alt="Illustration vérification" className="w-full h-auto" />
      </div>
    </div>
  );
}
