import { ShieldCheck, Lock } from "lucide-react";
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
        <div className="rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-500 tracking-wide mb-2">
            EXPÉDITEUR (CANADA)
          </p>
          <p className="text-lg font-semibold text-gray-800">Jean Dupont</p>
          <p className="text-sm text-gray-500">CAD · Toronto, ON</p>
        </div>

        <div className="rounded-2xl border border-gray-100 p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-500 tracking-wide">BÉNÉFICIAIRE</p>
          <input
            type="text"
            placeholder="Entrez un numéro de téléphone ou de wallet"
            value={form.beneficiaryContact}
            onChange={(e) => onChange("beneficiaryContact", e.target.value)}
            className="w-full h-14 rounded-xl border border-gray-200 px-4 text-base bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-afrilink-green"
          />
          <select
            value={form.country}
            onChange={(e) => onChange("country", e.target.value)}
            className="w-full h-14 rounded-xl border border-gray-200 px-4 text-base bg-white text-gray-900"
          >
            <option value="CM">Cameroun (XAF)</option>
            <option value="SN">Sénégal (XOF)</option>
            <option value="CI">Côte d'Ivoire (XOF)</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-500 mb-3">Vous envoyez</p>
        <div className="flex items-center rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <input
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => onChange("amount", e.target.value)}
            className="flex-1 h-16 px-4 text-lg text-gray-900 bg-white focus:outline-none"
          />
          <span className="px-4 text-base font-semibold text-gray-500 border-l border-gray-100 bg-white">
            CAD
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6 text-base">
        <div className="flex items-center justify-between text-gray-500">
          <span className="font-medium">Taux de change</span>
          <span>1 CAD = {EXCHANGE_RATE_CAD_XAF.toFixed(2)} XAF</span>
        </div>
        <div className="flex items-center justify-between text-gray-500">
          <span className="font-medium">Frais de transfert (AfriLink)</span>
          <span className="text-afrilink-green font-semibold">Gratuit (Promo)</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-afrilink-dark text-white px-5 py-4 mb-6">
        <span className="text-base font-medium">Le bénéficiaire reçoit</span>
        <span className="text-2xl font-bold">
          {new Intl.NumberFormat("fr-FR").format(received)} XAF
        </span>
      </div>

      <button
        onClick={onSubmit}
        disabled={!form.beneficiaryContact || amountNumber <= 0}
        className="w-full h-14 rounded-2xl bg-afrilink-green hover:bg-afrilink-greenHover text-white text-base font-semibold transition-colors disabled:opacity-50 mb-6"
      >
        Confirmer
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
          <ShieldCheck className="w-4 h-4 text-afrilink-green mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-700">Fonds Protégés</p>
            <p className="text-[11px] text-gray-500">
              Vos fonds sont séquestrés et protégés par la réglementation financière
              canadienne.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
          <Lock className="w-4 h-4 text-afrilink-green mt-0.5 shrink-0" />
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
