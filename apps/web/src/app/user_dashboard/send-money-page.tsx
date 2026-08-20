import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import type { UserProfile } from '@afrilinkpay/shared';
import { DashboardLayout } from '@/components/user_dashboard/dash-layout';
import { DashboardHeader } from '@/components/user_dashboard/header';
import { StepIndicator } from '@/components/user_dashboard/send/step-indicator';
import { BeneficiaryAmountForm } from '@/components/user_dashboard/send/beneficiary-amount-form';
import { ReviewStep } from '@/components/user_dashboard/send/review-step';
import { PinSetupModal } from '@/components/user_dashboard/send/pin-setup-modal';
import { PinConfirmModal } from '@/components/user_dashboard/send/pin-confirm-modal';
import { WalletSelector } from '@/components/user_dashboard/send/wallet-selector';
import { usePin } from '@/hooks/use-pin';
import { userService } from '@/lib/api/user.service';
import { walletService } from '@/lib/api/wallet.service';
import { transactionService } from '@/lib/api/transaction.service';
import { getCountryByCode } from '@/data/countries';

const steps = [
  { label: 'Bénéficiaire' },
  { label: 'Montant' },
  { label: 'Confirmation' },
  { label: 'Révision' },
  { label: 'Envoi' },
];

const NETWORK_TO_MODE: Record<string, string> = {
  mtn_momo: 'mtn',
  MTN_MOMO: 'mtn',
  orange_money: 'orange',
  ORANGE_MONEY: 'orange',
  wave: 'wallet',
  WAVE: 'wallet',
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  CM: 'XAF', GA: 'XAF', CG: 'XAF', TD: 'XAF', CF: 'XAF', GQ: 'XAF',
  SN: 'XOF', CI: 'XOF', NE: 'XOF', ML: 'XOF', BF: 'XOF', TG: 'XOF', BJ: 'XOF',
  CA: 'CAD',
  FR: 'EUR', BE: 'EUR', CH: 'EUR', DE: 'EUR',
};

export default function SendMoneyPage() {
  const [searchParams] = useSearchParams();

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: walletService.list,
  });

  const sendableWallets = wallets.filter(
    (w) => w.status === 'active' && !w.label?.toLowerCase().includes('tontine'),
  );
  const primaryWallet = wallets.find((w) => w.isPrimary) ?? wallets[0] ?? null;
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(
    primaryWallet?.id ?? null,
  );
  const selectedWallet = sendableWallets.find((w) => w.id === selectedWalletId) ?? primaryWallet;

  const { hasPin, createPin, checkPinStatus } = usePin(selectedWallet?.id ?? null);

  useEffect(() => {
    checkPinStatus();
  }, [checkPinStatus]);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });
  const availableCurrencies = [...new Set(wallets.map((w) => w.currency).filter(Boolean))];

  const senderInfo = profile
    ? {
        fullName: `${profile.prenom} ${profile.nom}`,
        city: profile.ville,
        country: profile.pays,
        currency: selectedWallet?.currency ?? COUNTRY_TO_CURRENCY[profile.pays] ?? 'XAF',
        walletId: selectedWallet?.walletNumber,
        availableCurrencies: availableCurrencies.length > 0 ? availableCurrencies : [selectedWallet?.currency ?? 'XAF'],
      }
    : undefined;

  const [form, setForm] = useState({
    beneficiaryContact: '',
    senderCountry: '',
    country: 'CM',
    amount: '',
    receptionMode: 'wallet' as string,
  });

  const destCountry = useMemo(() => getCountryByCode(form.country), [form.country]);
  const destCountryName = destCountry?.name ?? 'l\'étranger';

  const [completedSteps, setCompletedSteps] = useState([false, false, false, false, false]);
  const [phase, setPhase] = useState<'form' | 'review' | 'success'>('form');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'toReview' | 'toSend' | null>(null);
  const [beneficiaryName, setBeneficiaryName] = useState('');

  // Set sender country from profile
  useEffect(() => {
    if (profile?.pays && !form.senderCountry) {
      setForm((prev) => ({ ...prev, senderCountry: profile.pays }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.pays]);

  // Pre-fill from URL params
  useEffect(() => {
    const name = searchParams.get('name') ?? '';
    const phone = searchParams.get('phone') ?? '';
    const country = searchParams.get('country') ?? 'CM';
    const network = searchParams.get('network') ?? '';

    if (name || phone) {
      setBeneficiaryName(name);
      setForm((prev) => ({
        ...prev,
        beneficiaryContact: phone,
        country,
        receptionMode: NETWORK_TO_MODE[network] ?? 'wallet',
      }));
      setCompletedSteps((s) => {
        const updated = [...s];
        updated[0] = !!phone;
        return updated;
      });
    }
  }, [searchParams]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      setCompletedSteps((s) => {
        const updated = [...s];
        updated[0] = !!next.beneficiaryContact;
        updated[1] = parseFloat(next.amount) > 0;
        return updated;
      });

      return next;
    });
  };

  const handleFormSubmit = () => {
    setCompletedSteps((prev) => {
      const updated = [...prev];
      updated[2] = true;
      return updated;
    });
    setPhase('review');
  };

  const handleSendClick = () => {
    setPendingAction('toSend');
    if (!hasPin) {
      setShowPinSetup(true);
    } else {
      setShowPinConfirm(true);
    }
  };

  const handlePinConfirm = async (pin: string): Promise<boolean> => {
    if (!selectedWallet?.id || !form.beneficiaryContact || !form.amount) return false;

    try {
      const isMobileMoney = form.receptionMode === 'mtn' || form.receptionMode === 'orange';

      if (isMobileMoney) {
        const phoneDigits = form.beneficiaryContact.replace(/\D/g, '');
        const phoneWithPrefix = phoneDigits.length === 9 ? `237${phoneDigits}` : phoneDigits;

        await transactionService.campayWithdraw({
          walletNumber: selectedWallet.walletNumber,
          amount: form.amount,
          phone_number: phoneWithPrefix,
          description: `Retrait via ${form.receptionMode === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}`,
        });
      } else {
        await transactionService.createTransfer(selectedWallet.id, {
          toWalletId: form.beneficiaryContact,
          amount: form.amount,
          description: form.receptionMode === 'wallet' ? 'Transfert' : undefined,
          pin,
        });
      }

      setShowPinConfirm(false);
      setCompletedSteps((prev) => {
        const updated = [...prev];
        updated[2] = true;
        if (pendingAction === 'toSend') updated[3] = true;
        if (pendingAction === 'toSend') updated[4] = true;
        return updated;
      });
      setPhase('success');
      return true;
    } catch {
      return false;
    }
  };

  const handlePinSetupComplete = async (pin: string) => {
    await createPin(pin);
    setShowPinSetup(false);
    setShowPinConfirm(true);
  };

  const currentStepIndex =
    phase === 'form' ? (completedSteps[1] ? 1 : 0) : phase === 'review' ? 3 : 4;

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <h1 className="text-2xl sm:text-2xl md:text-2xl font-bold text-afrilink-dark mb-2 sm:mb-3 leading-tight">
          Transfert vers {destCountryName}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-5 sm:mb-8">
          Vérifiez les détails de votre transaction avant de confirmer.
        </p>

        <div
          className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-4 sm:mb-6"
          style={{
            backgroundColor: '#082B37',
            boxShadow: '0 1px 2px rgba(8,43,55,0.15), 0 8px 20px -6px rgba(8,43,55,0.35)',
          }}
        >
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <StepIndicator
              steps={steps}
              currentStep={currentStepIndex}
              completedSteps={completedSteps}
            />
          </div>
        </div>

        <div className="relative rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: '#D28E2F' }}
              />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-400">
                {steps[currentStepIndex]?.label}
              </span>
            </div>

            {phase === 'form' && (
              <>
                <WalletSelector
                  wallets={sendableWallets}
                  selectedWalletId={selectedWalletId}
                  onSelect={(w) => {
                    setSelectedWalletId(w.id);
                    checkPinStatus();
                  }}
                />
                <BeneficiaryAmountForm
                  form={form}
                  onChange={handleChange}
                  onSubmit={handleFormSubmit}
                  sender={senderInfo}
                />
              </>
            )}

            {phase === 'review' && (
              <ReviewStep
                beneficiaryContact={form.beneficiaryContact}
                senderCountryCode={form.senderCountry}
                countryCode={form.country}
                receptionMode={form.receptionMode}
                amount={parseFloat(form.amount) || 0}
                onSend={handleSendClick}
                onBack={() => setPhase('form')}
                sender={senderInfo}
                beneficiaryName={beneficiaryName}
              />
            )}

            {phase === 'success' && (
              <div className="text-center py-8 sm:py-10 px-2">
                <img
                  src="/thank you.svg"
                  alt="Merci"
                  className="mx-auto mb-4 h-56 w-auto"
                />
                <h2 className="text-base sm:text-lg font-bold text-afrilink-green mb-2">
                  Transfert envoyé avec succès !
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Le bénéficiaire recevra les fonds sous quelques minutes.
                </p>
                <button
                  onClick={() => {
                    setPhase('form');
                    setForm({ beneficiaryContact: '', senderCountry: form.senderCountry, country: 'CM', amount: '', receptionMode: 'wallet' });
                    setCompletedSteps([false, false, false, false, false]);
                    setBeneficiaryName('');
                    setShowPinSetup(false);
                    setShowPinConfirm(false);
                    setPendingAction(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#082B37' }}
                >
                  Nouveau transfert
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPinSetup && (
        <PinSetupModal onComplete={handlePinSetupComplete} onClose={() => setShowPinSetup(false)} />
      )}

      {showPinConfirm && (
        <PinConfirmModal
          walletId={selectedWallet?.id ?? ''}
          onConfirm={handlePinConfirm}
          onClose={() => setShowPinConfirm(false)}
        />
      )}
    </DashboardLayout>
  );
}
