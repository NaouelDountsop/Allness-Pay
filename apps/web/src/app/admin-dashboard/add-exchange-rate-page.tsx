import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin-dashboard/admin-layout';
import { SectionCard } from '@/components/ui/section-card';
import { Toggle } from '@/components/ui/toggle';
import { adminService } from '@/lib/api/admin.service';

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

export default function AddExchangeRatePage() {
  const navigate = useNavigate();
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [rate, setRate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data: currencies = [], isLoading: loadingCurrencies } = useQuery({
    queryKey: ['admin-currencies'],
    queryFn: adminService.listCurrencies,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createExchangeRate,
    onSuccess: () => {
      navigate('/admin/taux-de-change');
    },
  });

  const canSubmit = fromCurrency && toCurrency && fromCurrency !== toCurrency && rate && Number(rate) > 0;

  const handleSave = () => {
    if (!canSubmit) return;
    createMutation.mutate({
      fromCurrencyCode: fromCurrency,
      toCurrencyCode: toCurrency,
      rate: Number(rate),
      isActive,
    });
  };

  return (
    <AdminLayout active="parametres">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/taux-de-change')}
          className="flex items-center gap-2 text-sm font-semibold text-allness-dark"
        >
          <ArrowLeft className="w-4 h-4" />
          Ajouter un taux de change
        </button>
        <p className="text-[11px] text-gray-400 mt-1 ml-6">Taux de change &gt; Ajouter</p>
      </div>

      <div className="max-w-2xl flex flex-col gap-5">
        <SectionCard title="Informations générales">
          {loadingCurrencies ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-allness-orange animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Devise source</Label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-allness-dark focus:outline-none focus:ring-1 focus:ring-allness-orange bg-white"
                  >
                    <option value="">Sélectionner</option>
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Devise cible</Label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-allness-dark focus:outline-none focus:ring-1 focus:ring-allness-orange bg-white"
                  >
                    <option value="">Sélectionner</option>
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label>Taux de change</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="Ex: 655.9578"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 h-10">
                  <span className="text-xs text-gray-500">Statut</span>
                  <Toggle checked={isActive} onChange={setIsActive} />
                  <span className={`text-xs font-medium ${isActive ? 'text-allness-green' : 'text-gray-400'}`}>
                    {isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </>
          )}
        </SectionCard>

        <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-600 leading-relaxed">
            Les modifications de taux sont immédiates et affichées. Les nouveaux taux sont appliqués
            immédiatement à la prochaine transaction du taux système.
          </p>
        </div>

        {createMutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            Échec de la création. Vérifiez les informations et réessayez.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            onClick={() => navigate('/admin/taux-de-change')}
            className="h-10 px-5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!canSubmit || createMutation.isPending}
            className="h-10 px-5 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Enregistrer le taux
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
