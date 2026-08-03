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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-afrilink-dark px-5 py-5 flex items-start justify-between shrink-0">
          <div>
            <p className="text-white text-base font-bold mb-1">Transaction</p>
            <p className="text-white/50 text-[11px] mb-2">
              {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
              {" à "}
              {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <Badge tone={tone} dot>
              {transactionService.getTypeLabel(transaction.type)}
            </Badge>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white" aria-label="Fermer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <SectionCard title="Montant & Type" icon={Wallet}>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Montant"
                value={`${credit ? "+" : "-"} ${new Intl.NumberFormat("fr-FR").format(transaction.amount)} ${currency}`}
              />
              <Field label="Type" value={transactionService.getTypeLabel(transaction.type)} />
              <Field label="Référence" value={transaction.reference ?? transaction.id.slice(0, 8)} />
              <Field label="Description" value={transaction.description ?? "—"} />
            </div>
          </SectionCard>

          <SectionCard title="Détails" icon={MapPin}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Portefeuille" value={transaction.walletId.slice(0, 8)} />
              <Field label="Portefeuille lié" value={transaction.relatedWalletId?.slice(0, 8) ?? "—"} />
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

        <div className="p-5 pt-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-10 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
