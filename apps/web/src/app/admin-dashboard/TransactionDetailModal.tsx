import { X, Wallet, MapPin, History, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "../../components/ui";
import { SectionCard, Field } from "../../components/ui/section-card";

export interface TransactionTimeline {
  label: string;
  meta: string;
}

export interface TransactionDetail {
  reference: string;
  date: string;
  status: "Complété" | "En attente" | "Bloqué";
  amount: string;
  type: string;
  fees: string;
  device: string;
  location: string;
  timeline: TransactionTimeline[];
}

const STATUS_TONE: Record<string, "green" | "orange" | "red"> = {
  Complété: "green",
  "En attente": "orange",
  Bloqué: "red",
};

export function TransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction: TransactionDetail;
  onClose: () => void;
}) {
  const tone = STATUS_TONE[transaction.status] ?? "orange";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-afrilink-dark px-5 py-5 flex items-start justify-between shrink-0">
          <div>
            <p className="text-white text-base font-bold mb-1">Transaction</p>
            <p className="text-white/50 text-[11px] mb-2">{transaction.reference}</p>
            <div className="flex items-center gap-2">
              <Badge tone={tone} dot>
                {transaction.status}
              </Badge>
              <span className="text-white/40 text-[11px]">{transaction.date}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <SectionCard title="Montant & Frais" icon={Wallet}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Montant" value={transaction.amount} />
              <Field label="Frais" value={transaction.fees} />
              <Field label="Type" value={transaction.type} />
              <Field label="Statut" value={transaction.status} />
            </div>
          </SectionCard>

          <SectionCard title="Appareil & Localisation" icon={MapPin}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Appareil" value={transaction.device} />
              <Field label="Localisation" value={transaction.location} />
            </div>
          </SectionCard>

          <SectionCard title="Historique" icon={History} tone="green">
            <div className="flex flex-col gap-3">
              {transaction.timeline.map((step, i) => {
                const isLast = i === transaction.timeline.length - 1;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    {isLast ? (
                      <CheckCircle2 className="w-4 h-4 text-afrilink-green shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-afrilink-dark">{step.label}</p>
                      <p className="text-[11px] text-gray-500">{step.meta}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {transaction.status === "Bloqué" && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-600 mb-1">Transaction bloquée</p>
                <p className="text-[11px] text-gray-500">
                  Cette transaction a été bloquée par le système de détection de fraude.
                </p>
                <div className="flex gap-2 mt-3">
                  <button className="h-8 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium hover:opacity-90 transition-opacity">
                    Débloquer
                  </button>
                  <button className="h-8 px-4 rounded-lg bg-red-500 text-white text-xs font-medium hover:opacity-90 transition-opacity">
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          )}
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
