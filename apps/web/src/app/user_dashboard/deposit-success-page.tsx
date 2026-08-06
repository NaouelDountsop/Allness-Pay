import { useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, ArrowRight, Download, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { useDepositFlow } from "../../context/deposit-flow-context";
function formatDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) +
    " à " +
    date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const OPERATOR_LABEL: Record<string, string> = {
  mtn: "MTN Mobile Money",
  orange: "Orange Money",
};

export default function DepositSuccessPage() {
  const navigate = useNavigate();
  const { deposit, reset } = useDepositFlow();

  const handleBackToWallet = () => {
    reset();
    navigate("wallet");
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-afrilink-orange/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-afrilink-orange" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-afrilink-dark">Dépôt réussi !</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          Votre portefeuille a été crédité avec succès.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-10">
          <div className="flex justify-center mb-8">
            <span className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-11 h-11 text-afrilink-green" />
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400">Montant crédité</span>
              <span className="text-lg font-bold text-afrilink-green">
                +{deposit.amount || "5 000"} FCFA
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">Référence</span>
              <span className="text-xs font-mono text-afrilink-dark">
                {deposit.transactionId ? `TXN-${deposit.transactionId.slice(0, 12).toUpperCase()}` : "TXN-20240527-BF7K2Z"}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">Date</span>
              <span className="text-xs text-afrilink-dark">{formatDate(deposit.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">Opérateur</span>
              <span className="text-xs text-afrilink-dark">{OPERATOR_LABEL[deposit.operator]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Statut</span>
              <span className="text-xs font-semibold text-afrilink-green">Succès</span>
            </div>
          </div>

          <div className="rounded-xl bg-green-50 border border-green-100 p-4 flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] text-green-700 mb-1">Nouveau solde</p>
              <p className="text-lg font-bold text-afrilink-dark">125 000 FCFA</p>
            </div>
            <Eye className="w-4 h-4 text-green-600" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleBackToWallet}
              className="h-12 rounded-lg bg-afrilink-green text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Retour au portefeuille
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="h-11 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Télécharger le reçu
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
