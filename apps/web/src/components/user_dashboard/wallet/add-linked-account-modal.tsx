import { useState, useEffect } from 'react';
import type { Wallet as ApiWallet } from '@afrilinkpay/shared';
import {
  linkedAccountService,
  type CreateLinkedAccountPayload,
  type LinkedAccountType,
  type LinkedAccountOperator,
} from '@/lib/api/linked-account.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Smartphone, Building2, ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface AddLinkedAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: ApiWallet[];
}

const MOBILE_OPERATORS = [
  { value: 'orange_money' as LinkedAccountOperator, label: 'Orange Money' },
  { value: 'mtn_momo' as LinkedAccountOperator, label: 'MTN Mobile Money' },
  { value: 'wave' as LinkedAccountOperator, label: 'Wave' },
  { value: 'free_money' as LinkedAccountOperator, label: 'Free Money' },
];

const BANKS = ['Ecobank Cameroun', 'BICEC', 'UBA', 'SGBC', 'Afriland First Bank'];

const INTERNATIONAL_BANKS = [
  'Standard Chartered',
  'HSBC',
  'BNP Paribas',
  'Société Générale',
  'Citibank',
];

export function AddLinkedAccountModal({ open, onOpenChange, wallets }: AddLinkedAccountModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountType, setAccountType] = useState<LinkedAccountType | null>(null);
  const [operator, setOperator] = useState<LinkedAccountOperator>('orange_money');
  const [bankName, setBankName] = useState('');
  const [label, setLabel] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [currency, setCurrency] = useState('XAF');
  const [selectedWalletId, setSelectedWalletId] = useState('');

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateLinkedAccountPayload) => linkedAccountService.create(data),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      onOpenChange(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setStep(1);
    setAccountType(null);
    setOperator('orange_money');
    setBankName('');
    setLabel('');
    setPhoneNumber('');
    setAccountNumber('');
    setIban('');
    setSwiftCode('');
    setCurrency('XAF');
    setSelectedWalletId('');
  };

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      const primary = wallets.find((w) => w.isPrimary);
      if (primary) setSelectedWalletId(primary.id);
    }
  }, [wallets, selectedWalletId]);

  const handleConfirm = () => {
    let operatorValue: LinkedAccountOperator = 'other';
    if (accountType === 'mobile_money') operatorValue = operator;
    else if (accountType === 'bank_account') operatorValue = 'bank_app';

    const payload: CreateLinkedAccountPayload = {
      walletId: selectedWalletId,
      type: accountType!,
      operator: operatorValue,
      label,
      currency,
      ...(accountType === 'mobile_money' && { phoneNumber }),
      ...(accountType === 'bank_account' && { accountNumber, bankName }),
      ...(accountType === 'international_account' && { accountNumber, bankName, iban, swiftCode }),
    };
    createMutation.mutate(payload);
  };

  const isStep2Valid = () => {
    if (!selectedWalletId || !label || !currency) return false;
    if (accountType === 'mobile_money') return phoneNumber.length > 0;
    if (accountType === 'bank_account') return accountNumber.length > 0 && bankName.length > 0;
    if (accountType === 'international_account')
      return accountNumber.length > 0 && bankName.length > 0;
    return false;
  };

  const getStepSubtitle = () => {
    if (step === 1) return undefined;
    if (step === 2) {
      if (accountType === 'mobile_money') return 'Mobile Money (MTN, Orange, etc.)';
      if (accountType === 'bank_account') return 'Compte Bancaire (CEMAC)';
      return 'Compte International';
    }
    return 'Confirmez les informations';
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogClose
          onOpenChange={(v) => {
            if (!v) resetForm();
            onOpenChange(v);
          }}
        />

        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-allness-orange/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-allness-orange"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </span>
              Ajouter un compte lié
            </div>
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Rattachez un compte externe à votre portefeuille Allness Pay.'
              : getStepSubtitle()}
          </DialogDescription>
        </DialogHeader>

        <div
          className="rounded-2xl p-3 my-4"
          style={{
            backgroundColor: '#082B37',
            boxShadow: '0 1px 2px rgba(8,43,55,0.15), 0 8px 20px -6px rgba(8,43,55,0.35)',
          }}
        >
          <div className="flex items-center">
            {[
              { label: 'Type', num: 1 },
              { label: 'Informations', num: 2 },
              { label: 'Confirmation', num: 3 },
            ].map(({ label, num }, i) => {
              const isDone = step > num;
              const isActive = step === num;
              const isLast = i === 2;
              return (
                <div key={num} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                  <div className="flex flex-col items-center gap-1.5 min-w-[56px]">
                    <div
                      className="relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0"
                      style={{
                        backgroundColor: isDone || isActive ? '#D28E2F' : 'rgba(255,255,255,0.08)',
                        color: isDone || isActive ? '#082B37' : 'rgba(255,255,255,0.4)',
                        border: isDone || isActive ? 'none' : '2px solid rgba(255,255,255,0.25)',
                        boxShadow: isActive ? '0 0 0 4px rgba(210,142,47,0.25)' : 'none',
                      }}
                    >
                      {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : num}
                    </div>
                    <span
                      className="text-[10px] text-center leading-tight whitespace-nowrap transition-colors duration-300"
                      style={{
                        color: isActive
                          ? '#FFFFFF'
                          : isDone
                            ? 'rgba(255,255,255,0.75)'
                            : 'rgba(255,255,255,0.35)',
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className="flex-1 mx-1.5 -mt-5"
                      style={{
                        borderTop: '2px dashed rgba(255,255,255,0.5)',
                        minWidth: '20px',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Sélectionnez le type de compte que vous souhaitez lier
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAccountType('mobile_money')}
                className={`relative p-4 rounded-xl border-2 text-center transition ${
                  accountType === 'mobile_money'
                    ? 'border-allness-green bg-allness-green/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {accountType === 'mobile_money' && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-allness-green flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="h-6 w-6 text-allness-dark" />
                </div>
                <p className="font-semibold text-sm text-gray-800">Mobile Money</p>
                <p className="text-xs text-gray-500 mt-1">Orange Money, MTN Mobile Money, etc.</p>
              </button>

              <button
                onClick={() => setAccountType('international_account')}
                className={`relative p-4 rounded-xl border-2 text-center transition ${
                  accountType === 'international_account'
                    ? 'border-allness-orange bg-allness-orange/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {accountType === 'international_account' && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-allness-orange flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="h-6 w-6 text-allness-dark" />
                </div>
                <p className="font-semibold text-sm text-gray-800">Compte Bancaire</p>
                <p className="text-xs text-gray-500 mt-1">Compte bancaire local (CEMAC)</p>
              </button>
            </div>

            <div className="flex items-start gap-2 bg-allness-green/5 border border-allness-green/20 rounded-xl p-3 mt-4">
              <ShieldCheck className="h-5 w-5 text-allness-green shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                Vos informations sont sécurisées et cryptées. Elles ne sont jamais partagées sans
                votre consentement.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Wallet</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </span>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange appearance-none bg-white"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label ?? w.walletNumber} ({w.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {accountType === 'mobile_money' && (
              <>
                <div className="space-y-2">
                  <Label>Opérateur</Label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as LinkedAccountOperator)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange appearance-none bg-white"
                  >
                    {MOBILE_OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Libellé du compte</Label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="MTN MoMo personnel"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numéro de téléphone</Label>
                  <div className="flex">
                    <span className="flex items-center gap-1 px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm">
                      <span className="text-base">🇨🇲</span> +237
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const digitsOnly = raw.replace(/\D/g, '');
                        if (digitsOnly.length > 9) return;
                        setPhoneNumber(raw);
                      }}
                      placeholder="6 12 34 56 78"
                      maxLength={13}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange"
                    />
                  </div>
                </div>
              </>
            )}

            {accountType === 'bank_account' && (
              <>
                <div className="space-y-2">
                  <Label>Banque</Label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange appearance-none bg-white"
                  >
                    <option value="">Sélectionnez une banque</option>
                    {BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Libellé du compte</Label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Compte Ecobank personnel"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numéro de compte</Label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="10012345678901"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange"
                  />
                </div>
              </>
            )}

            {accountType === 'international_account' && (
              <>
                <div className="space-y-2">
                  <Label>Banque</Label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange appearance-none bg-white"
                  >
                    <option value="">Sélectionnez une banque</option>
                    {INTERNATIONAL_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Libellé du compte</Label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Compte HSBC personnel"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numéro de compte / IBAN</Label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="GB29NWBK60161331926819"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>IBAN</Label>
                    <input
                      type="text"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder="Optionnel"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SWIFT / BIC</Label>
                    <input
                      type="text"
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="Optionnel"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Devise</Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-allness-orange/20 focus:border-allness-orange appearance-none bg-white"
              >
                <option value="XAF">XAF - Franc CFA</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dollar américain</option>
                <option value="GBP">GBP - Livre sterling</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium">
                {accountType === 'mobile_money' && 'Mobile Money'}
                {accountType === 'bank_account' && 'Compte Bancaire'}
                {accountType === 'international_account' && 'Compte International'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Wallet</span>
              <span className="font-medium">
                {wallets.find((w) => w.id === selectedWalletId)?.label ??
                  wallets.find((w) => w.id === selectedWalletId)?.walletNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                {accountType === 'mobile_money' ? 'Opérateur' : 'Banque'}
              </span>
              <span className="font-medium">
                {accountType === 'mobile_money'
                  ? MOBILE_OPERATORS.find((op) => op.value === operator)?.label
                  : bankName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Libellé</span>
              <span className="font-medium">{label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                {accountType === 'mobile_money' ? 'Téléphone' : 'Numéro de compte'}
              </span>
              <span className="font-medium">
                {accountType === 'mobile_money' ? `+237 ${phoneNumber}` : accountNumber}
              </span>
            </div>
            {accountType === 'international_account' && iban && (
              <div className="flex justify-between">
                <span className="text-gray-500">IBAN</span>
                <span className="font-medium">{iban}</span>
              </div>
            )}
            {accountType === 'international_account' && swiftCode && (
              <div className="flex justify-between">
                <span className="text-gray-500">SWIFT / BIC</span>
                <span className="font-medium">{swiftCode}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Devise</span>
              <span className="font-medium">{currency}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
              Un code de vérification vous sera envoyé pour activer ce compte.
            </p>
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          )}
          {step < 3 ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Annuler
              </Button>
              <Button
                disabled={step === 1 ? !accountType : !isStep2Valid()}
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className="bg-allness-orange hover:bg-allness-orange/90"
              >
                Suivant
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={createMutation.isPending}
                className="bg-allness-orange hover:bg-allness-orange/90"
              >
                {createMutation.isPending ? 'Création...' : 'Confirmer'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
