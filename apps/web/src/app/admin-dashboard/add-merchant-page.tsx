import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Phone, IdCard, Landmark, ShieldCheck, UploadCloud } from 'lucide-react';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { SectionCard } from '../../components/ui/section-card';
import { Toggle } from '../../components/ui/toggle';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] text-gray-500 mb-1.5">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-allness-dark focus:outline-none focus:ring-1 focus:ring-allness-orange"
    />
  );
}

export default function AddMerchantPage() {
  const navigate = useNavigate();

  return (
    <AdminLayout active="marchands">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <button
          onClick={() => navigate('/admin/marchands')}
          className="flex items-center gap-2 text-sm font-semibold text-allness-dark"
        >
          <ArrowLeft className="w-4 h-4" />
          Ajouter un nouveau marchand
        </button>
        <button className="h-9 px-4 rounded-lg bg-allness-green text-white text-xs font-medium hover:opacity-90 transition-opacity">
          Enregistrer
        </button>
      </div>

      <div className="max-w-3xl flex flex-col gap-5">
        <SectionCard title="Informations générales" icon={Info}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Nom du marchand</Label>
              <Input placeholder="Ex: Boutique Horizon" />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Input placeholder="Ex: Commerce général" />
            </div>
          </div>
          <div className="mb-4">
            <Label>Description</Label>
            <textarea
              rows={3}
              placeholder="Brève description de l'activité du marchand"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-allness-dark focus:outline-none focus:ring-1 focus:ring-allness-orange resize-none"
            />
          </div>
          <div>
            <Label>Logo du marchand</Label>
            <div className="border border-dashed border-gray-200 rounded-lg py-6 flex flex-col items-center gap-2 text-gray-400">
              <UploadCloud className="w-5 h-5" />
              <p className="text-[11px]">Glissez une image ici ou cliquez pour importer</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Contact" icon={Phone}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Téléphone</Label>
              <Input placeholder="+237 6XX XX XX XX" />
            </div>
            <div>
              <Label>Email</Label>
              <Input placeholder="contact@marchand.com" />
            </div>
            <div className="sm:col-span-2">
              <Label>Adresse</Label>
              <Input placeholder="Adresse complète" />
            </div>
            <div>
              <Label>Ville</Label>
              <Input placeholder="Ville" />
            </div>
            <div>
              <Label>Pays</Label>
              <Input placeholder="Pays" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Informations légales" icon={IdCard}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>SIRET / RCCM</Label>
              <Input placeholder="Numéro d'enregistrement" />
            </div>
            <div>
              <Label>NIF</Label>
              <Input placeholder="Numéro d'identification fiscale" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Paramètres financiers" icon={Landmark}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Devise</Label>
              <Input defaultValue="XAF - Franc CFA" />
            </div>
            <div>
              <Label>Commission (%)</Label>
              <Input placeholder="Ex: 1.5" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Validation" icon={ShieldCheck}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-allness-dark">
                Activer le compte immédiatement
              </p>
              <p className="text-[11px] text-gray-400">
                Le marchand pourra recevoir des paiements dès la création.
              </p>
            </div>
            <Toggle checked />
          </div>
        </SectionCard>

        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            onClick={() => navigate('/admin/marchands')}
            className="h-10 px-5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button className="h-10 px-5 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity">
            Enregistrer le marchand
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
