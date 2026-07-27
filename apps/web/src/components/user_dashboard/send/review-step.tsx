import { EXCHANGE_RATE_CAD_XAF, mockRecentTransfers } from "@/lib/mock/send-money-data";

interface ReviewStepProps {
  beneficiaryContact: string;
  amount: number;
  onSend: () => void;
}

export function ReviewStep({ beneficiaryContact, amount, onSend }: ReviewStepProps) {
  const received = amount * EXCHANGE_RATE_CAD_XAF;

  return (
    <div className="text-base">
      <div className="rounded-2xl bg-afrilink-dark text-white p-5 mb-6 text-sm md:text-base leading-relaxed">
        <span className="font-semibold">L'expéditeur doit vérifier</span> l'exactitude
        des informations du bénéficiaire (nom, numéro) avant de valider l'opération.
        Aucun remboursement ne sera effectué si les fonds sont envoyés à un tiers par
        erreur.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-500 tracking-wide mb-2">
            EXPÉDITEUR (CANADA)
          </p>
          <p className="text-lg font-semibold text-gray-800">Jean Dupont</p>
          <p className="text-sm text-gray-500">CAD · Toronto, ON</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-500 tracking-wide mb-2">
            BÉNÉFICIAIRE (CAMEROUN)
          </p>
          <p className="text-lg font-semibold text-gray-800">
            {beneficiaryContact || "Marie-Thérèse Ngono"}
          </p>
          <p className="text-sm text-gray-500">XAF · Douala, Littoral</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Vous envoyez</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-800">{amount.toFixed(2)} CAD</p>
      </div>

      <div className="space-y-3 mb-6 text-base">
        <div className="flex items-center justify-between text-gray-600">
          <span className="font-medium">Taux de change</span>
          <span>1 CAD = {EXCHANGE_RATE_CAD_XAF.toFixed(2)} XAF</span>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <span className="font-medium">Frais de transfert (AfriLink Pay)</span>
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
          <p className="text-sm font-semibold mb-2">CAD/XAF Boosté</p>
          <span className="inline-block text-[11px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
            +0.4% au fixé
          </span>
        </div>
      </div>
    </div>
  );
}
