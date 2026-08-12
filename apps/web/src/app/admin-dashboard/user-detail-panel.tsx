import { useState } from 'react';
import { X, Fingerprint, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { Avatar, Badge, Tabs } from '../../components/ui';
import { Field, SectionCard } from '../../components/ui/section-card';

export function UserDetailPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState('Informations Personnelles');

  return (
    <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar initials="JD" size="lg" />
              <div>
                <p className="text-base font-bold text-afrilink-orange">John Doe</p>
                <p className="text-[11px] text-gray-400">ID: FG-98425551-JD</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge tone="green" dot>
                    Compte Actif
                  </Badge>
                  <Badge tone="blue">KYC Niveau 2</Badge>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-gray-500"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Tabs
            tabs={['Informations Personnelles', 'Portefeuilles', 'Activité Récente']}
            active={tab}
            onChange={setTab}
          />
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[55vh] overflow-y-auto">
          <SectionCard title="Identité" icon={Fingerprint} tone="orange">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom complet" value="John Doe" />
              <Field label="Date de naissance" value="12 Mai 1985" />
              <Field label="Sexe" value="Masculin" />
            </div>
          </SectionCard>

          <SectionCard title="Coordonnées" icon={Phone}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Numéro de téléphone" value="+237 670 00 00 00" />
              <Field label="Adresse email" value="j.doe@example.com" />
            </div>
          </SectionCard>

          <SectionCard title="Localisation" icon={MapPin}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ville & Pays" value="Douala, Cameroun" />
              <Field label="Adresse" value="BP..." />
            </div>
          </SectionCard>

          <SectionCard title="Résumé de conformité" icon={ShieldCheck} tone="green">
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Vérification d'identité</span>
                <Badge tone="green">Approuvée</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Justificatif de domicile</span>
                <span className="text-afrilink-dark font-medium">Validé</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Origine des fonds</span>
                <span className="text-afrilink-green font-medium">Auto-déclaré</span>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="p-5 pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
          <button className="h-10 px-4 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors flex-1">
            Suspendre le compte
          </button>
          <button className="h-10 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors flex-1">
            Réinitialiser le PIN
          </button>
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium hover:opacity-90 transition-opacity flex-1"
          >
            Fermer le profil
          </button>
        </div>
      </div>
    </div>
  );
}
