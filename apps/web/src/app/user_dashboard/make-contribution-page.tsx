import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Info, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import {
  PaymentMethodsGrid,
  type PaymentMethod,
} from '@/components/user_dashboard/tontines/payment-methods-grid';
import { TontineSummaryCard } from '@/components/user_dashboard/tontines/tontine-summary-card';
import { tontineService } from '@/lib/api/tontine.service';
import { walletService } from '@/lib/api/wallet.service';

const contributionSchema = z.object({
  amount: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 100 && Number.isInteger(num);
  }, "Le montant doit être un nombre entier d'au moins 100"),
  method: z.enum(['wallet', 'mtn_momo', 'orange_money', 'bank_transfer']),
  currency: z.enum(['XAF', 'USD', 'EUR']),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

const PAYMENT_TO_METHOD: Record<PaymentMethod, ContributionFormData['method']> = {
  wallet: 'wallet',
  card: 'wallet',
  mobile_money: 'mtn_momo',
  bank_transfer: 'bank_transfer',
};

const CURRENCY_OPTIONS = [
  { value: 'XAF' as const, label: 'CFA' },
  { value: 'EUR' as const, label: '€ EUR' },
  { value: 'USD' as const, label: 'USD' },
];

export default function MakeContributionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: tontine,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['tontine', id],
    queryFn: () => tontineService.getById(id!),
    enabled: !!id,
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet-primary'],
    queryFn: walletService.getPrimary,
  });

  const suggestedAmount = tontine ? String(tontine.contributionAmount) : '500';
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('wallet');
  const [currency, setCurrency] = useState<ContributionFormData['currency']>(
    (tontine?.currency as ContributionFormData['currency']) ?? 'XAF',
  );

  // Set initial amount from tontine once loaded
  const effectiveAmount = amount || suggestedAmount;

  const formValidation = contributionSchema.safeParse({
    amount: effectiveAmount,
    method: PAYMENT_TO_METHOD[method],
    currency,
  });
  const isFormValid = formValidation.success;
  const fieldErrors = !isFormValid ? formValidation.error.flatten().fieldErrors : null;

  const contributionMutation = useMutation({
    mutationFn: () => {
      return Promise.resolve({
        tontineId: id,
        amount: Number(effectiveAmount),
        method: PAYMENT_TO_METHOD[method],
        currency,
      });
    },
  });

  const handleConfirm = () => {
    if (!isFormValid) return;
    contributionMutation.mutate();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-afrilink-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (fetchError || !tontine) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="px-4 sm:px-8 pb-10">
          <button
            onClick={() => navigate('/dashboard/tontines')}
            className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark mb-1"
          >
            <ArrowLeft className="w-5 h-5" />
            Effectuer un versement
          </button>
          <p className="text-sm text-gray-500 mt-6">Tontine introuvable.</p>
        </div>
      </DashboardLayout>
    );
  }

  const nextDueDate = tontine.nextContributionAt
    ? new Date(tontine.nextContributionAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const activeMembers = tontine.members?.filter((m) => m.status === 'ACTIVE').length ?? 0;
  const walletBalance = wallet ? Number(wallet.balance) : 0;
  const walletCurrency = wallet?.currency ?? 'XAF';

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div className="px-4 sm:px-8 pb-10">
        <button
          onClick={() => navigate(`/dashboard/tontines/${id}`)}
          className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark mb-1"
        >
          <ArrowLeft className="w-5 h-5" />
          Effectuer un versement
        </button>
        <p className="text-sm text-gray-500 mb-6">
          Contribuez à la cagnotte collective de votre groupe.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 h-fit space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-500">Nom de la tontine</label>
              <div className="h-11 rounded-lg border border-gray-200 px-3 mt-1 flex items-center text-sm text-gray-800 bg-gray-50">
                {tontine.name}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500">Montant du versement</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={effectiveAmount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`flex-1 h-11 rounded-lg border px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 ${
                    fieldErrors?.amount
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                      : 'border-gray-200 focus:border-afrilink-orange focus:ring-afrilink-orange'
                  }`}
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as ContributionFormData['currency'])}
                  className="h-11 rounded-lg border border-gray-200 px-2 text-sm bg-white text-gray-900"
                >
                  {CURRENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors?.amount && (
                <p className="text-[11px] text-red-500 mt-1">{fieldErrors.amount[0]}</p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">
                Montant suggéré : {new Intl.NumberFormat('fr-FR').format(Number(tontine.contributionAmount))} {tontine.currency}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Mode de paiement
              </label>
              <PaymentMethodsGrid selected={method} onSelect={setMethod} />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Solde disponible Portefeuille :{' '}
                <span className="font-semibold">
                  {new Intl.NumberFormat('fr-FR').format(walletBalance)} {walletCurrency}
                </span>
              </p>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!isFormValid || contributionMutation.isPending}
              className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:bg-green-200"
            >
              {contributionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {contributionMutation.isPending ? 'Versement en cours...' : 'Confirmer le versement'}
            </button>
          </div>

          <TontineSummaryCard
            frequency={tontine.frequency}
            nextDueDate={nextDueDate}
            turnOrder={`${tontine.currentCycle} / ${tontine.memberLimit}`}
            totalPaid={Number(tontine.contributionAmount) * tontine.currentCycle}
            progressPercent={Math.round((tontine.currentCycle / tontine.memberLimit) * 100)}
            membersCount={activeMembers}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
