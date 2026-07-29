import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Info } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { PaymentMethodsGrid, type PaymentMethod } from "@/components/user_dashboard/tontines/payment-methods-grid";
import { TontineSummaryCard } from "@/components/user_dashboard/tontines/tontine-summary-card";

export default function MakeContributionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("500");
  const [method, setMethod] = useState<PaymentMethod>("wallet");

  const handleConfirm = () => {
    navigate(`/dashboard/tontines/${id}`);
  };

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Jean" userName="Alex Sterling" memberLabel="Premium Member" />

      <div className="px-4 sm:px-8 pb-10">
        <button
          onClick={() => navigate(`/dashboard/tontines/${id}`)}
          className="flex items-center gap-2 text-lg font-semibold text-afrilink-dark mb-1"
        >
          <ArrowLeft className="w-5 h-5" />
          Effectuer un versement
        </button>
        <p className="text-sm text-gray-500 mb-6">
          Contribuez à la cagnotte collective de votre groupe.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 h-fit space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-500">Nom de la tontine</label>
              <div className="h-11 rounded-lg border border-gray-200 px-3 mt-1 flex items-center text-sm text-gray-800 bg-gray-50">
                Solidarité Diaspora
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500">Montant du versement</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 h-11 rounded-lg border border-gray-200 px-3 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange"
                />
                <select className="h-11 rounded-lg border border-gray-200 px-2 text-sm bg-white text-gray-900">
                  <option>€ EUR</option>
                  <option>CFA</option>
                  <option>USD</option>
                </select>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Solde suggéré basé sur votre engagement mensuel
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">
                Mode de paiement
              </label>
              <PaymentMethodsGrid selected={method} onSelect={setMethod} />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Solde disponible Portefeuille: <span className="font-semibold">12 450,00 €</span>
              </p>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full h-11 rounded-lg bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Confirmer le versement
            </button>
          </div>

          <TontineSummaryCard
            frequency="Hebdomadaire"
            nextDueDate="21 Oct 2023"
            turnOrder="8 / 12"
            totalPaid={3500}
            progressPercent={66}
            membersCount={12}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
