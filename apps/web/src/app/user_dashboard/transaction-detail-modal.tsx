import { X, Wallet, MapPin, History, CheckCircle2 } from "lucide-react";
import { Badge } from "../../components/ui";
import { SectionCard, Field } from "../../components/ui/section-card";
import type { WalletTransaction } from "../../lib/api/transaction.service";
import { transactionService } from "../../lib/api/transaction.service";

const STATUS_TONE = {
  deposit: "green" as const,
  withdrawal: "green" as const,
  transfer_in: "green" as const,
  transfer_out: "orange" as const,
};

export function TransactionDetailModal({
  transaction,
  currency,
  onClose,
}: {
  transaction: WalletTransaction;
  currency: string;
  onClose: () => void;
}) {
  const credit = transactionService.isCredit(transaction.type);
  const tone = STATUS_TONE[transaction.type] ?? "orange";
  const date = new Date(transaction.createdAt);
  const formattedAmount = new Intl.NumberFormat("fr-FR").format(transaction.amount);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-afrilink-dark to-afrilink-darker px-6 py-6 flex items-start justify-between shrink-0 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5"
          />
          <div className="relative z-10">
            <p className="text-white text-lg font-bold mb-1.5">Détail de la transaction</p>
            <p className="text-white/50 text-[11px] mb-3">
              {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
              {" à "}
              {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <Badge tone={tone} dot>
              {transactionService.getTypeLabel(transaction.type)}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Montant en avant */}
        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <p className="text-[11px] text-gray-400 mb-1">Montant</p>
          <p className={`text-3xl font-bold ${credit ? "text-afrilink-green" : "text-gray-900"}`}>
            {credit ? "+" : "-"} {formattedAmount}{" "}
            <span className="text-base font-medium text-gray-400">{currency}</span>
          </p>
        </div>

        {/* Corps scrollable */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          <SectionCard title="Détails" icon={Wallet}>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Type" value={transactionService.getTypeLabel(transaction.type)} />
              <Field
                label="Référence"
                value={transaction.reference ?? transaction.id.slice(0, 8)}
              />
              <Field label="Description" value={transaction.description ?? "—"} />
            </div>
          </SectionCard>

          <SectionCard title="Portefeuilles" icon={MapPin}>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Portefeuille" value={transaction.walletId.slice(0, 8)} />
              <Field
                label="Portefeuille lié"
                value={transaction.relatedWalletId?.slice(0, 8) ?? "—"}
              />
            </div>
          </SectionCard>

          <SectionCard title="Historique" icon={History} tone="green">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-afrilink-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-afrilink-dark">Transaction créée</p>
                  <p className="text-[11px] text-gray-500">
                    {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-11 px-4 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}