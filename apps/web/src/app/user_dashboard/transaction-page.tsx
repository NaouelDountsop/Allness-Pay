import { useState } from "react";
import {
  Wallet,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  Download,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { DashboardLayout } from "../../components/user_dashboard/dash-layout";
import { DashboardHeader } from "../../components/user_dashboard/header";
import { StatCard, Badge } from "../../components/ui";
import { TransactionDetailModal } from "./transaction-detail-modal";
import type { WalletTransaction } from "../../lib/api/transaction.service";

interface TransactionRow {
  id: string;
  reference: string;
  description: string;
  type: WalletTransaction["type"];
  amount: number;
  status: "Complété" | "En attente" | "Bloqué";
  date: string;
}

const TRANSACTIONS: TransactionRow[] = [
  {
    id: "1",
    reference: "TXN-88213",
    description: "Dépôt Mobile Money — Awa Njoya",
    type: "deposit",
    amount: 65000,
    status: "Complété",
    date: "2026-07-27T18:40:00Z",
  },
  {
    id: "2",
    reference: "TXN-88214",
    description: "Retrait Mobile Money — Cissé Moktar",
    type: "withdrawal",
    amount: 120000,
    status: "En attente",
    date: "2026-07-27T17:12:00Z",
  },
  {
    id: "3",
    reference: "TXN-88215",
    description: "Transfert Tontine — Julie Moyo",
    type: "transfer_out",
    amount: 25000,
    status: "Bloqué",
    date: "2026-07-27T15:05:00Z",
  },
  {
    id: "4",
    reference: "TXN-88216",
    description: "Paiement Marchand — Ivan Tchoua",
    type: "withdrawal",
    amount: 8400,
    status: "Complété",
    date: "2026-07-27T13:51:00Z",
  },
  {
    id: "5",
    reference: "TXN-88217",
    description: "Transfert reçu — Marie L.",
    type: "transfer_in",
    amount: 75000,
    status: "Complété",
    date: "2026-07-25T07:15:00Z",
  },
];

const STATUS_TONE: Record<string, "green" | "orange" | "red"> = {
  Complété: "green",
  "En attente": "orange",
  Bloqué: "red",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

function toDetail(t: TransactionRow): WalletTransaction {
  return {
    id: t.id,
    walletId: "mock-wallet-id",
    type: t.type,
    amount: t.amount,
    relatedWalletId: null,
    reference: t.reference,
    description: t.description,
    createdAt: t.date,
  };
}

export default function TransactionsPage() {
  const [selected, setSelected] = useState<TransactionRow | null>(null);

  const totalVolume = TRANSACTIONS.reduce((sum, t) => {
    const credit = t.type === "deposit" || t.type === "transfer_in";
    return credit ? sum + t.amount : sum - t.amount;
  }, 0);

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
          <h1 className="text-xl sm:text-2xl font-bold text-afrilink-dark mb-1">Transactions</h1>
          <p className="text-sm text-gray-400 mb-6">
            Consultez l'historique de vos transactions.
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            <StatCard icon={Wallet} label="Volume total" value={`${new Intl.NumberFormat("fr-FR").format(totalVolume)} XAF`} />
            <StatCard icon={ShieldCheck} label="Transactions" value={`${TRANSACTIONS.length}`} />
            <StatCard icon={ShieldAlert} label="Complétées" value={`${TRANSACTIONS.filter((t) => t.status === "Complété").length}`} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-5">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
                  Type
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button className="h-9 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
                  Statut
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <button className="h-9 px-4 rounded-lg bg-afrilink-green text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Download className="w-3.5 h-3.5" />
                Exporter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                    <th className="font-medium pb-3">Utilisateur / Référence</th>
                    <th className="font-medium pb-3">Type</th>
                    <th className="font-medium pb-3">Montant</th>
                    <th className="font-medium pb-3">Statut</th>
                    <th className="font-medium pb-3">Date</th>
                    <th className="font-medium pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {TRANSACTIONS.map((t) => {
                    const credit = t.type === "deposit" || t.type === "transfer_in";
                    return (
                      <tr key={t.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3.5">
                          <p className="text-xs font-medium text-afrilink-dark">{t.reference}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[200px]">{t.description}</p>
                        </td>
                        <td className="text-xs text-gray-600">{t.type === "deposit" ? "Dépôt" : t.type === "withdrawal" ? "Retrait" : t.type === "transfer_in" ? "Transfert reçu" : "Transfert envoyé"}</td>
                        <td className={`text-xs font-medium ${credit ? "text-afrilink-green" : "text-red-500"}`}>
                          {credit ? "+" : "-"} {new Intl.NumberFormat("fr-FR").format(t.amount)} XAF
                        </td>
                        <td>
                          <Badge tone={STATUS_TONE[t.status]} dot>{t.status}</Badge>
                        </td>
                        <td className="text-xs text-gray-500">{formatDate(t.date)}</td>
                        <td className="text-right">
                          <button
                            onClick={() => setSelected(t)}
                            className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-afrilink-dark ml-auto"
                            aria-label="Voir"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-sm font-semibold text-red-600">Audit des Alertes</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-white rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-afrilink-dark">
                    Comportement inhabituel détecté — Cissé Moktar
                  </p>
                  <p className="text-[11px] text-gray-400">
                    3 retraits consécutifs supérieurs au seuil habituel · TXN-88214
                  </p>
                </div>
                <button className="h-8 px-4 rounded-lg bg-red-500 text-white text-xs font-medium hover:opacity-90 transition-opacity shrink-0">
                  Signaler
                </button>
              </div>
              <div className="bg-white rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-afrilink-dark">
                    Localisation inhabituelle — Julie Moyo
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Connexion depuis un nouvel appareil non reconnu · TXN-88215
                  </p>
                </div>
                <button className="h-8 px-4 rounded-lg bg-red-500 text-white text-xs font-medium hover:opacity-90 transition-opacity shrink-0">
                  Signaler
                </button>
              </div>
            </div>
          </div>
      </div>

      {selected && (
        <TransactionDetailModal
          transaction={toDetail(selected)}
          currency="XAF"
          onClose={() => setSelected(null)}
        />
      )}
    </DashboardLayout>
  );
}
