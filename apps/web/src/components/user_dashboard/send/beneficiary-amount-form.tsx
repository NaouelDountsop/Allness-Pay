import { useState, useMemo, useRef } from "react";
import { ShieldCheck, Lock, Banknote, ArrowRight, AlertCircle, Wallet, Smartphone } from "lucide-react";
import { EXCHANGE_RATE_CAD_XAF } from "@/lib/mock/send-money-data";
import { CountrySelect } from "@/components/common/country-select";
import { getCountryByCode, getFlagUrl, type Country } from "@/data/countries";

export type ReceptionMode = "wallet" | "mtn" | "orange" | "bank";

interface FormState {
  beneficiaryContact: string;
  country: string;
  amount: string;
  receptionMode: string;
}

interface BeneficiaryAmountFormProps {
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
  onSubmit: () => void;
}

const RECEPTION_OPTIONS: { id: ReceptionMode; label: string; logoUrl: string; fallbackColor: string }[] = [
  { id: "wallet", label: "Wallet AfriLinkPay", logoUrl: "/afrilinkpay_logo2.svg", fallbackColor: "bg-afrilink-dark" },
  { id: "mtn", label: "MTN Mobile Money", logoUrl: "/mtn-momo.png", fallbackColor: "bg-yellow-500" },
  { id: "orange", label: "Orange Money", logoUrl: "/orange-money.png", fallbackColor: "bg-orange-500" },
  { id: "bank", label: "Compte bancaire", logoUrl: "/bank.png", fallbackColor: "bg-blue-600" },
];

// Découpe le placeholder du pays (ex. "6XX XXX XXX") en groupes de longueurs [3, 3, 3]
// On compte la longueur totale de chaque groupe (chiffres ET "X"), pas seulement les vrais
// chiffres qu'il contient, car un pays peut avoir un chiffre fixe en tête (ex. le "6" du
// Cameroun) sans que ça réduise le nombre total de chiffres attendus.
function getGroupLengths(placeholder: string): number[] {
  return placeholder.split(" ").map((group) => group.length);
}

// Formate une suite de chiffres bruts selon les groupes du pays (ex. "612345678" -> "612 345 678")
function formatDigitsToPattern(digits: string, groupLengths: number[]): string {
  const parts: string[] = [];
  let cursor = 0;
  for (const len of groupLengths) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + len));
    cursor += len;
  }
  return parts.join(" ");
}

export function BeneficiaryAmountForm({ form, onChange, onSubmit }: BeneficiaryAmountFormProps) {
  const amountNumber = parseFloat(form.amount) || 0;
  const received = amountNumber * EXCHANGE_RATE_CAD_XAF;

  const selectedCountry = useMemo(
    () => getCountryByCode(form.country) ?? getCountryByCode("CM")!,
    [form.country],
  );
  const [touched, setTouched] = useState(false);
  const [walletMode, setWalletMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const groupLengths = useMemo(
    () => getGroupLengths(selectedCountry.phonePlaceholder),
    [selectedCountry],
  );
  const expectedDigitCount = useMemo(
    () => groupLengths.reduce((sum, n) => sum + n, 0),
    [groupLengths],
  );

  const localDigits = form.beneficiaryContact.replace(/\D/g, "");
  const isComplete = walletMode
    ? form.beneficiaryContact.length > 0
    : localDigits.length === expectedDigitCount;

  const isPhoneValid =
    form.beneficiaryContact.length === 0 ||
    (walletMode && form.beneficiaryContact.length > 0) ||
    localDigits.length === expectedDigitCount;

  const showPhoneError = touched && !walletMode && form.beneficiaryContact.length > 0 && !isPhoneValid;

  const handleCountryChange = (country: Country) => {
    onChange("country", country.code);
    onChange("beneficiaryContact", "");
    setWalletMode(false);
    setTouched(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleContactChange = (raw: string) => {
    if (walletMode) {
      onChange("beneficiaryContact", raw);
      return;
    }
    const digitsOnly = raw.replace(/\D/g, "").slice(0, expectedDigitCount);
    onChange("beneficiaryContact", formatDigitsToPattern(digitsOnly, groupLengths));
  };

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
            <div className="space-y-1.5">
              <CountrySelect
                value={form.country}
                onChange={handleCountryChange}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex flex-1 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setWalletMode(false);
                      onChange("beneficiaryContact", "");
                      setTouched(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-[2px] ${
                      !walletMode
                        ? "border-afrilink-green text-afrilink-green"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Téléphone
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWalletMode(true);
                      onChange("beneficiaryContact", "");
                      setTouched(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-[2px] ${
                      walletMode
                        ? "border-afrilink-green text-afrilink-green"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Wallet
                  </button>
                </div>
              </div>
              <div
                className={`flex items-center w-full h-12 rounded-xl border bg-white overflow-hidden focus-within:ring-2 transition-colors ${
                  showPhoneError
                    ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-200"
                    : isComplete
                    ? "border-afrilink-green focus-within:ring-afrilink-green/30"
                    : "border-gray-200 focus-within:border-afrilink-green focus-within:ring-afrilink-green/30"
                }`}
              >
                {!walletMode && (
                  <span className="flex items-center gap-1.5 h-full pl-4 pr-2 shrink-0 border-r border-gray-100 bg-gray-50/80 text-sm sm:text-base font-medium text-afrilink-dark select-none">
                    <img
                      src={getFlagUrl(selectedCountry.code)}
                      alt={selectedCountry.name}
                      className="w-5 h-auto rounded-sm object-cover"
                    />
                    {selectedCountry.dialCode}
                  </span>
                )}
                <input
                  ref={inputRef}
                  type={walletMode ? "text" : "tel"}
                  inputMode={walletMode ? "text" : "numeric"}
                  placeholder={walletMode ? "Identifiant wallet" : selectedCountry.phonePlaceholder}
                  value={form.beneficiaryContact}
                  onChange={(e) => handleContactChange(e.target.value)}
                  onBlur={() => setTouched(true)}
                  className="flex-1 min-w-0 h-full px-3 text-sm sm:text-base bg-white text-afrilink-dark placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              {showPhoneError && (
                <div className="flex items-start gap-1.5 mt-1.5 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    Le numéro doit contenir {expectedDigitCount} chiffres pour{" "}
                    {selectedCountry.name} (ex. {selectedCountry.dialCode}{" "}
                    {selectedCountry.phonePlaceholder}).
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mode de réception */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Mode de réception</p>
        <div className="grid grid-cols-2 gap-3">
          {RECEPTION_OPTIONS.map((option) => {
            const isSelected = form.receptionMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange("receptionMode", option.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-afrilink-green bg-afrilink-green/[0.05] shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className={`w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 ${
                  isSelected ? "bg-afrilink-green/10" : "bg-gray-50"
                }`}>
                  <img
                    src={option.logoUrl}
                    alt={option.label}
                    className="w-full h-full object-contain p-1.5"
                  />
                </span>
                <span className={`text-sm font-medium ${isSelected ? "text-afrilink-dark" : "text-gray-600"}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
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
        onClick={() => {
          setTouched(true);
          if (form.beneficiaryContact && amountNumber > 0 && isPhoneValid) {
            onSubmit();
          }
        }}
        disabled={!form.beneficiaryContact || amountNumber <= 0 || !isPhoneValid}
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