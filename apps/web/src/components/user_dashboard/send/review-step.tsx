import { EXCHANGE_RATE_CAD_XAF, mockRecentTransfers } from "@/lib/mock/send-money-data";
import { getCountryByCode, getFlagUrl } from "@/data/countries";
import { Info, ArrowLeft } from "lucide-react";

interface ReviewStepProps {
  beneficiaryContact: string;
  senderCountryCode: string;
  countryCode: string;
  receptionMode: string;
  amount: number;
  onSend: () => void;
  onBack: () => void;
}

const RECEPTION_LABELS: Record<string, string> = {
  wallet: "Wallet AfriLinkPay",
  mtn: "MTN Mobile Money",
  orange: "Orange Money",
  bank: "Compte bancaire",
};

interface ReviewStepProps {
  beneficiaryContact: string;
  senderCountryCode: string;
  countryCode: string;
  amount: number;
  onSend: () => void;
  onBack: () => void;
}

export function ReviewStep({ beneficiaryContact, senderCountryCode, countryCode, receptionMode, amount, onSend, onBack }: ReviewStepProps) {
  const received = amount * EXCHANGE_RATE_CAD_XAF;
  const senderCountry = getCountryByCode(senderCountryCode);
  const senderCountryName = senderCountry?.name?.toUpperCase() ?? "EXPÉDITEUR";
  const country = getCountryByCode(countryCode);
  const countryName = country?.name?.toUpperCase() ?? "PAYS INCONNU";
  const currency = countryCode === "CM" || countryCode === "GA" || countryCode === "CG" || countryCode === "CD"
    ? "XAF"
    : countryCode === "SN" || countryCode === "CI" || countryCode === "NE" || countryCode === "ML" || countryCode === "BF" || countryCode === "TG" || countryCode === "BJ"
      ? "XOF"
      : countryCode === "FR"
        ? "EUR"
        : countryCode === "US" || countryCode === "CA"
          ? "USD"
          : "XAF";

  return (
    <div className="text-base">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-afrilink-dark hover:text-afrilink-orange transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 text-blue-800 p-5 mb-6 text-sm md:text-base leading-relaxed">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <p>
          <span className="font-semibold">L'expéditeur doit vérifier</span> l'exactitude
          des informations du bénéficiaire (nom, numéro) avant de valider l'opération.
          Aucun remboursement ne sera effectué si les fonds sont envoyés à un tiers par
          erreur.
        </p>
      </div>

      {/* Expéditeur — Bénéficiaire */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Expéditeur */}
        <div className="rounded-2xl border-2 border-gray-200 p-5 bg-gray-50/60">
          <div className="flex items-center gap-3 mb-3">
            {senderCountry && (
              <img
                src={getFlagUrl(senderCountry.code)}
                alt={senderCountry.name}
                className="w-8 h-auto rounded-sm object-cover"
              />
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                Expéditeur
              </p>
              <p className="text-sm text-gray-500">{senderCountryName}</p>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-800">Jean Dupont</p>
          <p className="text-sm text-gray-500">CAD · Toronto, ON</p>
        </div>

        {/* Bénéficiaire */}
        <div className="rounded-2xl border-2 border-afrilink-green/30 p-5 bg-afrilink-green/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            {country && (
              <img
                src={getFlagUrl(country.code)}
                alt={country.name}
                className="w-8 h-auto rounded-sm object-cover"
              />
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                Bénéficiaire
              </p>
              <p className="text-sm text-gray-500">{countryName}</p>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-800">
            {beneficiaryContact || "Marie-Thérèse Ngono"}
          </p>
          <p className="text-sm text-gray-500">{currency}</p>
        </div>
      </div>

      {/* Mode de réception */}
      <div className="mb-5 rounded-xl border-2 border-afrilink-green/20 bg-afrilink-green/[0.03] p-4">
        <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-1">Mode de réception</p>
        <p className="text-base font-semibold text-afrilink-dark">{RECEPTION_LABELS[receptionMode] ?? "Wallet AfriLinkPay"}</p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Vous envoyez</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-800">{amount.toFixed(2)} CAD</p>
      </div>

      <div className="space-y-3 mb-6 text-base">
        <div className="flex items-center justify-between text-gray-600">
          <span className="font-medium">Taux de change</span>
          <span>1 CAD = {EXCHANGE_RATE_CAD_XAF.toFixed(2)} {currency}</span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span className="font-medium">Frais de transfert (AfriLink Pay)</span>
          <span className="text-afrilink-green font-semibold">Gratuit (Promo)</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-afrilink-dark text-white px-5 py-4 mb-6">
        <span className="text-base font-medium">Le bénéficiaire reçoit</span>
        <span className="text-2xl font-bold">
          {new Intl.NumberFormat("fr-FR").format(received)} {currency}
        </span>
      </div>

      <button
        onClick={onSend}
        className="w-full h-14 rounded-2xl bg-afrilink-green hover:bg-afrilink-greenHover text-white text-base font-semibold transition-colors mb-6"
      >
        Envoyer
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">Transferts Récents</p>
          <ul className="space-y-2">
            {mockRecentTransfers.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-gray-700">{t.name}</p>
                    <p className="text-gray-400">{t.location}</p>
                  </div>
                </div>
                <span className="text-gray-600 font-medium">
                  {t.amount} {t.currency}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-afrilink-dark text-white p-4">
          <p className="text-xs text-white/60 mb-1">Taux en temps réel</p>
          <p className="text-sm font-semibold mb-2">CAD/{currency} Boosté</p>
          <span className="inline-block text-[11px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
            +0.4% au fixé
          </span>
        </div>
      </div>
    </div>
  );
}