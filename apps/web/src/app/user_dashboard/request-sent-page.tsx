import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Info, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { DepositStepper } from "../../components/ui/deposit-stepper";
import { useDepositFlow } from "../../context/deposit-flow-context";

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone || "6 70 ** ** **";
  return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ** ** **`;
}

export default function RequestSentPage() {
  const navigate = useNavigate();
  const { deposit } = useDepositFlow();

  // Simule la réception de la notification côté opérateur avant de
  // laisser l'utilisateur passer à l'étape de confirmation.
  // À remplacer par un polling réel de GET /wallets/deposits/:id ou un websocket.
  useEffect(() => {
    const timer = setTimeout(() => navigate("/deposit/confirm"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <DashboardLayout>
      <DashboardHeader firstName="" userName="Dépôt" memberLabel="Portefeuille" />
      <DepositStepper current={2} />

      <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-20 md:pb-10">
      <div className="w-full max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-afrilink-dark mb-2">Demande envoyée</h1>
        <p className="text-sm text-gray-500 mb-6 sm:mb-8">
          Votre demande de dépôt a été envoyée avec succès à votre téléphone. Veuillez confirmer
          le paiement pour finaliser la transaction.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 mb-5">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-12 h-12 rounded-full border-2 border-dashed border-afrilink-orange flex items-center justify-center shrink-0 animate-spin [animation-duration:3s]">
              <span className="w-2 h-2 rounded-full bg-afrilink-orange" />
            </span>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Demande envoyée à</p>
              <p className="text-sm font-medium text-afrilink-dark">
                +237 {maskPhone(deposit.phoneNumber)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <p className="text-2xl font-bold text-afrilink-dark">
              {deposit.amount || "5 000"} FCFA
            </p>
            <span className="px-2.5 py-1 rounded-full bg-orange-50 text-afrilink-orange text-[11px] font-semibold">
              EN ATTENTE
            </span>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[11px] text-gray-400 mb-1">Référence</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-gray-600">{deposit.reference}</p>
              <button className="text-gray-300 hover:text-afrilink-dark" aria-label="Copier">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-[1fr_260px] gap-6">
          <div>
            <p className="text-sm font-semibold text-afrilink-dark mb-4">Suivi de la transaction</p>
            <div className="flex flex-col gap-4">
              <TimelineItem label="Demande envoyée" status="done" hint="À l'instant" />
              <TimelineItem label="Notification en cours" status="active" hint="En attente" />
              <TimelineItem label="Confirmation utilisateur" status="pending" hint="En attente" />
              <TimelineItem label="Crédit du portefeuille" status="pending" hint="En attente" />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4 h-fit">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-600 leading-relaxed">
              Vous n'avez rien à faire pour le moment. Veuillez vérifier votre téléphone et
              confirmer le paiement Mobile Money.
            </p>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}

function TimelineItem({
  label,
  hint,
  status,
}: {
  label: string;
  hint: string;
  status: "done" | "active" | "pending";
}) {
  return (
    <div className="flex items-center gap-3">
      {status === "done" ? (
        <CheckCircle2 className="w-4.5 h-4.5 text-afrilink-green shrink-0" />
      ) : (
        <span
          className={`w-4.5 h-4.5 rounded-full border-2 shrink-0 ${
            status === "active" ? "border-afrilink-orange bg-orange-50" : "border-gray-200"
          }`}
        />
      )}
      <div>
        <p className={`text-xs font-medium ${status === "pending" ? "text-gray-400" : "text-afrilink-dark"}`}>
          {label}
        </p>
        <p className="text-[11px] text-gray-400">{hint}</p>
      </div>
    </div>
  );
}
