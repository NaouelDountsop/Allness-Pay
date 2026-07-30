import { ShieldCheck, Lock, Phone, Globe, Banknote, ArrowRight } from "lucide-react";
import { EXCHANGE_RATE_CAD_XAF } from "@/lib/mock/send-money-data";

interface FormState {
  beneficiaryContact: string;
  country: string;
  amount: string;
}

interface BeneficiaryAmountFormProps {
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
  onSubmit: () => void;
}

export function BeneficiaryAmountForm({ form, onChange, onSubmit }: BeneficiaryAmountFormProps) {
  const amountNumber = parseFloat(form.amount) || 0;
  const received = amountNumber * EXCHANGE_RATE_CAD_XAF;

  return (
    <div className="text-base">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Expéditeur */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50/60">
          <p className="text-xs font-semibold text-afrilink-gray tracking-wider mb-2 uppercase">
            Expéditeur (Canada)
          </p>
          <p className="text-lg font-semibold text-afrilink-dark">Jean Dupont</p>
          <p className="text-sm text-gray-500">CAD · Toronto, ON</p>
        </div>

        {/* Bénéficiaire */}
        <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
          <p className="text-xs font-semibold text-afrilink-gray tracking-wider uppercase">
            Bénéficiaire
          </p>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Téléphone ou wallet
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-orange" />
              <input
                type="text"
                placeholder="+237 6 00 00 00 00"
                value={form.beneficiaryContact}
                onChange={(e) => onChange("beneficiaryContact", e.target.value)}
                className="w-full h-12 rounded-xl border border-gray-200 pl-11 pr-4 text-sm sm:text-base bg-white text-afrilink-dark placeholder:text-gray-400 focus:outline-none focus:border-afrilink-green focus:ring-2 focus:ring-afrilink-green/30 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Pays de destination
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-orange pointer-events-none" />
              <select
                value={form.country}
                onChange={(e) => onChange("country", e.target.value)}
                className="w-full h-12 rounded-xl border border-gray-200 pl-11 pr-9 text-sm sm:text-base bg-white text-afrilink-dark appearance-none focus:outline-none focus:border-afrilink-green focus:ring-2 focus:ring-afrilink-green/30 transition-colors"
              >
                <option value="CM">Cameroun (XAF)</option>
                <option value="SN">Sénégal (XOF)</option>
                <option value="CI">Côte d'Ivoire (XOF)</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-afrilink-gray pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Montant */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Vous envoyez</label>
        <div className="flex items-center rounded-2xl border-2 border-gray-200 bg-white overflow-hidden focus-within:border-afrilink-green transition-colors">
          <Banknote className="w-5 h-5 text-afrilink-orange ml-4 shrink-0" />
          <input
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => onChange("amount", e.target.value)}
            className="flex-1 h-16 min-w-0 px-3 text-xl sm:text-2xl font-semibold text-afrilink-dark bg-white focus:outline-none"
          />
          <span className="px-4 sm:px-5 h-full flex items-center text-sm sm:text-base font-semibold text-gray-600 border-l border-gray-100 bg-gray-50 shrink-0">
            CAD
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6 text-sm sm:text-base">
        <div className="flex items-center justify-between text-gray-500">
          <span className="font-medium">Taux de change</span>
          <span className="text-afrilink-dark font-semibold">
            1 CAD = {EXCHANGE_RATE_CAD_XAF.toFixed(2)} XAF
          </span>
        </div>
        <div className="flex items-center justify-between text-gray-500">
          <span className="font-medium">Frais de transfert (AfriLink)</span>
          <span className="text-afrilink-green font-semibold">Gratuit (Promo)</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-2xl bg-afrilink-dark text-white px-5 py-4 mb-6">
        <span className="text-sm sm:text-base font-medium text-white/80">
          Le bénéficiaire reçoit
        </span>
        <span className="text-xl sm:text-2xl font-bold text-afrilink-orange">
          {new Intl.NumberFormat("fr-FR").format(received)} XAF
        </span>
      </div>

      <button
        onClick={onSubmit}
        disabled={!form.beneficiaryContact || amountNumber <= 0}
        className="w-full h-14 rounded-2xl bg-afrilink-green hover:bg-afrilink-greenHover text-white text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-6 flex items-center justify-center gap-2"
      >
        Confirmer
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
          <ShieldCheck className="w-4 h-4 text-afrilink-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-700">Fonds Protégés</p>
            <p className="text-[11px] text-gray-500">
              Vos fonds sont séquestrés et protégés par la réglementation financière
              canadienne.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
          <Lock className="w-4 h-4 text-afrilink-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-700">Transaction Sécurisée</p>
            <p className="text-[11px] text-gray-500">
              Chiffrement AES-256 de bout en bout pour toutes vos données
              transactionnelles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}