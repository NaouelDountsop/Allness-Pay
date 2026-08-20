import { useQuery } from '@tanstack/react-query';
import { getExchangeRate, CURRENCY_SYMBOLS } from '@/lib/mock/send-money-data';
import { getCountryByCode, getFlagUrl } from '@/data/countries';
import { transactionService, type WalletTransaction } from '@/lib/api/transaction.service';
import { Info, ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  CM: 'XAF', GA: 'XAF', CG: 'XAF', TD: 'XAF', CF: 'XAF', GQ: 'XAF',
  SN: 'XOF', CI: 'XOF', NE: 'XOF', ML: 'XOF', BF: 'XOF', TG: 'XOF', BJ: 'XOF',
  CA: 'CAD',
  FR: 'EUR', BE: 'EUR', CH: 'EUR', DE: 'EUR',
};

interface ReviewStepProps {
  beneficiaryContact: string;
  senderCountryCode: string;
  countryCode: string;
  receptionMode: string;
  amount: number;
  onSend: () => void;
  onBack: () => void;
  sender?: {
    fullName: string;
    city?: string;
    country?: string;
    currency?: string;
    walletId?: string;
  };
  beneficiaryName?: string;
}

const RECEPTION_LABELS: Record<string, string> = {
  wallet: 'Wallet AllnessPay',
  mtn: 'MTN Mobile Money',
  orange: 'Orange Money',
  bank: 'Compte bancaire',
};

export function ReviewStep({
  beneficiaryContact,
  senderCountryCode,
  countryCode,
  receptionMode,
  amount,
  onSend,
  onBack,
  sender,
  beneficiaryName,
}: ReviewStepProps) {
  const senderCurrency = sender?.currency ?? 'CAD';
  const receiverCurrency = COUNTRY_TO_CURRENCY[countryCode] ?? 'XAF';
  const exchangeRate = getExchangeRate(senderCurrency, receiverCurrency);
  const fees = amount * 0.01;
  const totalDebit = amount + fees;
  const received = amount * exchangeRate;

  const senderCountry = getCountryByCode(senderCountryCode);
  const senderCountryName = senderCountry?.name ?? 'Expéditeur';
  const country = getCountryByCode(countryCode);
  const countryName = country?.name ?? 'Pays inconnu';

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['transactions-review', sender?.walletId],
    queryFn: () => transactionService.listByWallet(sender!.walletId!),
    enabled: !!sender?.walletId,
    retry: false,
  });

  const lastFive = recentTransactions.slice(0, 5);

  return (
    <div className="text-base">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-allness-dark hover:text-allness-orange transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 text-blue-800 p-5 mb-6 text-sm md:text-base leading-relaxed">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <p>
          <span className="font-semibold">L'expéditeur doit vérifier</span> l'exactitude des
          informations du bénéficiaire (nom, numéro) avant de valider l'opération. Aucun
          remboursement ne sera effectué si les fonds sont envoyés à un tiers par erreur.
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
                className="w-8 h-6 rounded-sm object-cover"
              />
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                Expéditeur
              </p>
              <p className="text-sm font-medium text-gray-700">{senderCountryName}</p>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-800">
            {sender?.fullName ?? 'Utilisateur'}
          </p>
          <p className="text-sm text-gray-500">
            {senderCurrency} · {sender?.city ?? ''}
          </p>
        </div>

        {/* Bénéficiaire */}
        <div className="rounded-2xl border-2 border-allness-green/30 p-5 bg-allness-green/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            {country && (
              <img
                src={getFlagUrl(country.code)}
                alt={country.name}
                className="w-8 h-6 rounded-sm object-cover"
              />
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                Bénéficiaire
              </p>
              <p className="text-sm font-medium text-gray-700">{countryName}</p>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-800">
            {beneficiaryName || beneficiaryContact || 'Bénéficiaire'}
          </p>
          {beneficiaryName && beneficiaryContact && (
            <p className="text-sm text-gray-500">{beneficiaryContact}</p>
          )}
          <p className="text-sm text-gray-500">{receiverCurrency}</p>
        </div>
      </div>

      {/* Mode de réception */}
      <div className="mb-5 rounded-xl border-2 border-allness-green/20 bg-allness-green/[0.03] p-4">
        <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-1">
          Mode de réception
        </p>
        <p className="text-base font-semibold text-allness-dark">
          {RECEPTION_LABELS[receptionMode] ?? 'Wallet AllnessPay'}
        </p>
      </div>

      {/* Vous envoyez */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Vous envoyez</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-800">
          {new Intl.NumberFormat('fr-FR').format(amount)} {CURRENCY_SYMBOLS[senderCurrency] ?? senderCurrency}
        </p>
      </div>

      {/* Taux + Frais + Total */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">Taux de change</span>
          <span className="text-allness-dark font-semibold">
            1 {senderCurrency} = {exchangeRate.toFixed(4)} {receiverCurrency}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">Frais de transfert (1%)</span>
          <span className="text-allness-dark font-semibold">
            {new Intl.NumberFormat('fr-FR').format(fees)} {CURRENCY_SYMBOLS[senderCurrency] ?? senderCurrency}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-allness-dark">Total débité</span>
            <span className="text-xl font-bold text-allness-dark">
              {new Intl.NumberFormat('fr-FR').format(totalDebit)} {CURRENCY_SYMBOLS[senderCurrency] ?? senderCurrency}
            </span>
          </div>
        </div>
      </div>

      {/* Le bénéficiaire reçoit — design cohérent avec les autres pages */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-2xl bg-[#082B37] text-white px-5 py-4 mb-6">
        <span className="text-sm sm:text-base font-medium text-white/80">
          Le bénéficiaire reçoit
        </span>
        <span className="text-xl sm:text-2xl font-bold text-[#D28E2F]">
          {new Intl.NumberFormat('fr-FR').format(received)} {receiverCurrency}
        </span>
      </div>

      <button
        onClick={onSend}
        className="w-full h-14 rounded-2xl bg-allness-green hover:bg-allness-greenHover text-white text-base font-semibold transition-colors mb-6"
      >
        Envoyer
      </button>

      {/* Transferts récents — données réelles */}
      {lastFive.length > 0 && (
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">Transferts récents</p>
          <ul className="space-y-2">
            {lastFive.map((t: WalletTransaction) => {
              const credit = transactionService.isCredit(t.type);
              return (
                <li key={t.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      credit ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {credit ? (
                        <ArrowDownLeft className="w-3 h-3 text-allness-green" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 text-red-500" />
                      )}
                    </span>
                    <div>
                      <p className="text-gray-700 font-medium">
                        {t.reference || transactionService.getTypeLabel(t.type)}
                      </p>
                      <p className="text-gray-400">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${credit ? 'text-allness-green' : 'text-red-500'}`}>
                    {credit ? '+' : '-'}{new Intl.NumberFormat('fr-FR').format(t.amount)} {senderCurrency}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
