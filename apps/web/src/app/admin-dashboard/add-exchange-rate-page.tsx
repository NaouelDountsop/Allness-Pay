import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
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
      className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
    />
  );
}

function Select({ children }: { children: React.ReactNode }) {
  return (
    <select className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-1 focus:ring-afrilink-orange bg-white">
      {children}
    </select>
  );
}

export default function AddExchangeRatePage() {
  const navigate = useNavigate();

  return (
    <AdminLayout active="parametres">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/taux-de-change')}
          className="flex items-center gap-2 text-sm font-semibold text-afrilink-dark"
        >
          <ArrowLeft className="w-4 h-4" />
          Ajouter un taux de change
        </button>
        <p className="text-[11px] text-gray-400 mt-1 ml-6">Taux de change &gt; Ajouter</p>
      </div>

      <div className="max-w-2xl flex flex-col gap-5">
        <SectionCard title="Informations générales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label>Paire de devises</Label>
              <Select>
                <option>USD - Dollar US</option>
              </Select>
            </div>
            <div>
              <Label>&nbsp;</Label>
              <Select>
                <option>XAF - Franc CFA</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label>Taux de change</Label>
              <Input placeholder="Ex: 607.25" />
            </div>
            <div className="flex items-center gap-3 h-10">
              <span className="text-xs text-gray-500">Statut</span>
              <Toggle checked />
              <span className="text-xs font-medium text-afrilink-green">Actif</span>
              <span className="text-xs text-gray-300">Inactif</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Source & Fiabilité">
          <div className="mb-4">
            <Label>Source des données</Label>
            <Select>
              <option>Sélectionner une source</option>
              <option>Bloomberg</option>
              <option>Banque Centrale</option>
            </Select>
          </div>
          <div className="mb-4">
            <Label>Fréquence de mise à jour</Label>
            <Select>
              <option>Temps réel (WebSocket)</option>
              <option>Manuel</option>
              <option>Toutes les heures</option>
            </Select>
          </div>
          <div className="mb-4">
            <Label>Fiabilité de la source (%)</Label>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-afrilink-green rounded-full" style={{ width: '99.5%' }} />
              </div>
              <span className="text-xs font-medium text-afrilink-dark w-12 text-right">99.5%</span>
            </div>
          </div>
          <div>
            <Label>Notes (optionnel)</Label>
            <textarea
              rows={2}
              placeholder="Ajouter une note sur ce fournisseur..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-1 focus:ring-afrilink-orange resize-none"
            />
          </div>
        </SectionCard>

        <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-600 leading-relaxed">
            Les modifications de taux sont immédiates et affichées. Les nouveaux taux sont appliqués
            immédiatement à la prochaine transaction du taux système.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            onClick={() => navigate('/admin/taux-de-change')}
            className="h-10 px-5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button className="h-10 px-5 rounded-lg bg-afrilink-green text-white text-sm font-medium hover:opacity-90 transition-opacity">
            Enregistrer le taux
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
