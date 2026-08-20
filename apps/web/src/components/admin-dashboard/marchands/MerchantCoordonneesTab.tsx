import { FileText } from 'lucide-react';
import { SectionCard, Field } from '../../ui/section-card';

export function MerchantCoordonneesTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <SectionCard title="Coordonnées" className="lg:col-span-2">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Téléphone principal" value="+237 655 12 34 56" />
          <Field label="Email professionnel" value="contact@boutiquehorizon.cm" />
          <Field label="Adresse" value="Avenue Kennedy, Marché Central" />
          <Field label="Ville & Pays" value="Douala, Cameroun" />
        </div>
      </SectionCard>

      <div className="flex flex-col gap-5">
        <SectionCard title="Statut du Compte">
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Type de compte</span>
              <span className="font-medium text-allness-dark">Marchand Premium</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Commission</span>
              <span className="font-medium text-allness-dark">1.5%</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Documents" icon={FileText}>
          <ul className="flex flex-col gap-2 text-xs text-gray-600">
            <li className="flex items-center justify-between">
              Registre de commerce
              <span className="text-allness-green font-medium">Validé</span>
            </li>
            <li className="flex items-center justify-between">
              Pièce d'identité gérant
              <span className="text-allness-green font-medium">Validé</span>
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
