import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Info, X, ArrowRight, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { useDepositFlow } from "../../context/deposit-flow-context";


export default function PhoneConfirmationPage() {
  const navigate = useNavigate();
  const { deposit, reset } = useDepositFlow();

  // Bank deposits skip phone confirmation entirely
  useEffect(() => {
    if (deposit.method === "bank") {
      navigate("/deposit/processing", { replace: true });
    }
  }, [deposit.method, navigate]);

  const handleCancel = () => {
    reset();
    navigate("/deposit");
  };

  const handleConfirmed = () => {
    // TODO: déclenche le polling / websocket de statut réel côté API
    navigate("/deposit/processing");
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-afrilink-orange/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-afrilink-orange" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-afrilink-dark">Confirmation du paiement</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          Vous avez reçu une demande de paiement sur votre téléphone. Veuillez entrer votre code
          secret Mobile Money pour confirmer.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <span className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-afrilink-orange" />
            </span>
            <p className="text-xs text-gray-400 mb-1">Confirmer le paiement de</p>
            <p className="text-2xl font-bold text-afrilink-dark mb-1">
              {deposit.amount || "5 000"} FCFA
            </p>
            <p className="text-xs text-gray-400">vers AfriLink Pay</p>
          </div>

          <div className="rounded-xl bg-orange-50 border border-orange-100 p-4 text-center mb-4">
            <p className="text-xs text-afrilink-orange font-medium">
              Saisissez votre code secret Mobile Money pour autoriser le paiement.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4 mb-6">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-600 leading-relaxed">
              Cette opération est sécurisée par votre opérateur Mobile Money. Aucune information
              confidentielle n'est partagée avec AfriLink Pay.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCancel}
              className="h-11 px-5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors flex-1"
            >
              Annuler la transaction
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleConfirmed}
              className="h-11 px-5 rounded-lg bg-afrilink-green text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity flex-1"
            >
              Je l'ai confirmé, vérifier le statut
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
