import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
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

export default function EditExchangeRatePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [fromCurrency, toCurrency] = (id ?? '').split('-');
  const [rate, setRate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { data: exchangeRate, isLoading: loadingRate } = useQuery({
    queryKey: ['admin-exchange-rate', fromCurrency, toCurrency],
    queryFn: () => adminService.getExchangeRate(fromCurrency!, toCurrency!),
    enabled: !!fromCurrency && !!toCurrency,
  });

  const { data: currencies = [], isLoading: loadingCurrencies } = useQuery({
    queryKey: ['admin-currencies'],
    queryFn: adminService.listCurrencies,
  });

  useEffect(() => {
    if (exchangeRate) {
      setRate(String(exchangeRate.rate));
      setIsActive(exchangeRate.isActive);
    }
  }, [exchangeRate]);

  const updateMutation = useMutation({
    mutationFn: () =>
      adminService.updateExchangeRate(fromCurrency!, toCurrency!, {
        rate: Number(rate),
        isActive,
      }),
    onSuccess: () => {
      navigate('/admin/taux-de-change');
    },
  });

  const canSubmit = rate && Number(rate) > 0;

  const fromLabel = currencies.find((c) => c.code === fromCurrency);
  const toLabel = currencies.find((c) => c.code === toCurrency);

  const handleSave = () => {
    if (!canSubmit) return;
    updateMutation.mutate();
  };

  return (
    <AdminLayout active="parametres">
      <button
        onClick={() => navigate('/admin/taux-de-change')}
        className="flex items-center gap-2 text-sm font-semibold text-allness-dark mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Modifier un taux de change
      </button>

      {loadingRate || loadingCurrencies ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-allness-orange animate-spin" />
        </div>
      ) : (
        <div className="max-w-2xl flex flex-col gap-5">
          <SectionCard title="Informations générales">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Devise source</Label>
                <div className="h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center text-sm text-allness-dark font-medium">
                  {fromCurrency} {fromLabel ? `- ${fromLabel.name}` : ''}
                </div>
              </div>
              <div>
                <Label>Devise cible</Label>
                <div className="h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center text-sm text-allness-dark font-medium">
                  {toCurrency} {toLabel ? `- ${toLabel.name}` : ''}
                </div>
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
          </SectionCard>

          <SectionCard title="Informations supplémentaires">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Date de création</Label>
                <Input
                  defaultValue={exchangeRate?.createdAt ? new Date(exchangeRate.createdAt).toLocaleDateString('fr-FR') : '—'}
                  disabled
                />
              </div>
              <div>
                <Label>Dernière mise à jour</Label>
                <Input
                  defaultValue={exchangeRate?.updatedAt ? new Date(exchangeRate.updatedAt).toLocaleDateString('fr-FR') : '—'}
                  disabled
                />
              </div>
            </div>
          </SectionCard>

          {updateMutation.isError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              Échec de la mise à jour. Vérifiez les informations et réessayez.
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
              disabled={!canSubmit || updateMutation.isPending}
              className="h-10 px-5 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer les modifications
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
