import { useState } from 'react';
import { ArrowLeft, ChevronDown, CheckCircle2, Info, QrCode, Zap, Droplet, Wifi, Tv, Smartphone, Phone } from 'lucide-react';
import { billersByCategory } from '@/lib/mock/payments-data';

const categoryMeta: Record<string, { label: string; description: string; icon: typeof Zap; color: string }> = {
  electricity: { label: 'Électricité', description: "Payez votre facture d'électricité", icon: Zap, color: 'text-yellow-600' },
  water: { label: 'Eau', description: "Réglez votre facture d'eau", icon: Droplet, color: 'text-blue-600' },
  internet: { label: 'Internet', description: 'Payez votre abonnement', icon: Wifi, color: 'text-cyan-600' },
  tv: { label: 'TV / Canal+', description: 'Renouvelez votre abonnement', icon: Tv, color: 'text-red-600' },
  airtime: { label: 'Airtime & Data', description: 'Rechargez un numéro', icon: Smartphone, color: 'text-green-600' },
  phone: { label: 'Téléphone', description: 'Payez vos services', icon: Phone, color: 'text-purple-600' },
};

const stepLabels = ['Détails', 'Vérification', 'Paiement', 'Reçu'];

interface PaymentStepperProps {
  category: string;
  walletBalance?: number;
  onBack: () => void;
}

export function PaymentStepper({ category, walletBalance = 125500, onBack }: PaymentStepperProps) {
  const [step, setStep] = useState(1);
  const [supplier, setSupplier] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [supplierOpen, setSupplierOpen] = useState(false);

  const meta = (categoryMeta[category] ?? categoryMeta.electricity) as (typeof categoryMeta)[string];
  const Icon = meta.icon;
  const billers = billersByCategory[category] ?? [];
  const selectedBiller = billers.find((b) => b.key === supplier);
  const numericAmount = parseInt(amount.replace(/\s/g, ''), 10) || 0;
  const balanceAfter = walletBalance - numericAmount;

  const format = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  const handleVerify = () => {
    if (supplier && accountNumber) setStep(2);
  };

  const handleContinue = () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3 && numericAmount > 0) {
      setStep(4);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <button
          onClick={onBack}
          className="text-xs text-gray-500 hover:text-allness-green inline-flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour aux services
        </button>
        <div className="flex items-center gap-3">
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 ${meta.color}`}>
            <Icon className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-allness-dark">{meta.label}</h2>
            <p className="text-xs text-gray-500">{meta.description}</p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isCompleted = step > num;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      isCompleted
                        ? 'bg-allness-green text-white'
                        : isActive
                          ? 'bg-allness-dark text-white'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : num}
                  </span>
                  <span
                    className={`text-[10px] mt-1 font-medium ${
                      isActive ? 'text-allness-dark' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 mb-4 ${
                      step > num ? 'bg-allness-green' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-5">
        {step === 1 && (
          <div className="space-y-4">
            {/* Supplier dropdown */}
            <div>
              <label className="text-xs font-medium text-gray-500">Fournisseur</label>
              <div className="relative mt-1">
                <button
                  type="button"
                  onClick={() => setSupplierOpen(!supplierOpen)}
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm bg-white text-gray-900 flex items-center justify-between focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                >
                  <span className={selectedBiller ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedBiller?.name ?? 'Sélectionnez un fournisseur'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      supplierOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {supplierOpen && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {billers.map((b) => (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => {
                          setSupplier(b.key);
                          setSupplierOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                          supplier === b.key ? 'bg-allness-green/5 text-allness-green font-medium' : 'text-gray-900'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Account number */}
            <div>
              <label className="text-xs font-medium text-gray-500">Numéro de compte</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 pr-10 text-sm bg-white text-gray-900 focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                />
                {accountNumber && (
                  <button
                    type="button"
                    onClick={() => setAccountNumber('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={!supplier || !accountNumber}
              className="w-full h-11 rounded-lg bg-allness-dark hover:bg-allness-dark/90 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium transition-colors"
            >
              Vérifier le compte
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-allness-orange" />
                <span className="text-xs font-medium text-gray-700">Informations du compte</span>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Titulaire</dt>
                  <dd className="font-medium text-gray-800">JEAN DUPONT</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="font-medium text-gray-800">Prépayé</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Solde actuel</dt>
                  <dd className="font-medium text-allness-dark">4 250 XAF</dd>
                </div>
              </dl>
            </div>
            <button
              onClick={handleContinue}
              className="w-full h-11 rounded-lg bg-allness-dark hover:bg-allness-dark/90 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              Continuer
              <span className="text-lg">→</span>
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Montant</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                    if (raw) {
                      setAmount(new Intl.NumberFormat('fr-FR').format(parseInt(raw, 10)));
                    } else {
                      setAmount('');
                    }
                  }}
                  placeholder="0"
                  className="w-full h-11 rounded-lg border border-gray-200 px-3 pr-12 text-sm bg-white text-gray-900 text-right font-semibold focus:outline-none focus:border-allness-orange focus:ring-1 focus:ring-allness-orange"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                  XAF
                </span>
              </div>
            </div>

            {numericAmount > 0 && (
              <div className="rounded-lg bg-green-50 p-3 text-xs text-green-700 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                Solde après paiement : <span className="font-semibold">{format(balanceAfter)} XAF</span>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={numericAmount <= 0}
              className="w-full h-11 rounded-lg bg-allness-dark hover:bg-allness-dark/90 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              Continuer
              <span className="text-lg">→</span>
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-allness-green/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-allness-green" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-allness-dark">Paiement réussi</h3>
              <p className="text-xs text-gray-500 mt-1">
                Votre paiement de {format(numericAmount)} XAF a été effectué avec succès.
              </p>
            </div>
            <dl className="rounded-xl bg-gray-50 p-4 text-sm text-left space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">Fournisseur</dt>
                <dd className="font-medium text-gray-800">{selectedBiller?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Compte</dt>
                <dd className="font-medium text-gray-800">{accountNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Montant</dt>
                <dd className="font-semibold text-allness-dark">{format(numericAmount)} XAF</dd>
              </div>
            </dl>
            <button
              onClick={onBack}
              className="w-full h-11 rounded-lg bg-allness-dark hover:bg-allness-dark/90 text-white text-sm font-medium transition-colors"
            >
              Retour aux services
            </button>
          </div>
        )}
      </div>

      {/* QR Code Section (step 1 only) */}
      {step === 1 && (
        <div className="px-5 pb-5">
          <div className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="w-4 h-4 text-allness-dark" />
              <span className="text-xs font-medium text-gray-700">Payer par QR Code</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">
              Scannez le QR code du fournisseur pour payer directement.
            </p>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-gray-300" />
              </div>
              <ul className="space-y-1.5 text-[11px] text-gray-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-allness-green" />
                  Rapide et sécurisé
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-allness-green" />
                  Sans saisie manuelle
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-allness-green" />
                  Compatible tous opérateurs
                </li>
              </ul>
            </div>
            <button className="w-full h-10 mt-3 rounded-lg border border-allness-dark text-allness-dark text-xs font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <QrCode className="w-4 h-4" />
              Scanner un QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
