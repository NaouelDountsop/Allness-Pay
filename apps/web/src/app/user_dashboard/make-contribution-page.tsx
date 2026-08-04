import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lock, Info, ChevronDown } from "lucide-react";
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

      <div className="px-4 sm:px-6 lg:px-8 pb-10">
        <button
          onClick={() => navigate(`/dashboard/tontines/${id}`)}
          className="flex items-center gap-2 text-base sm:text-lg font-semibold text-afrilink-dark mb-1"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Effectuer un versement
        </button>
        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          Contribuez à la cagnotte collective de votre groupe.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {/* Carte principale */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-4 sm:mb-5">Détails du versement</h3>

              <div className="space-y-4 sm:space-y-5">
                {/* Tontine name */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Nom de la tontine</label>
                  <div className="h-11 sm:h-12 rounded-xl border border-gray-200 px-3 sm:px-4 flex items-center text-sm text-gray-800 bg-gray-50/50">
                    Solidarité Diaspora
                  </div>
                </div>

                {/* Montant */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Montant du versement</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 h-11 sm:h-12 rounded-xl border border-gray-200 px-3 sm:px-4 text-sm bg-white text-gray-900 focus:outline-none focus:border-afrilink-orange focus:ring-1 focus:ring-afrilink-orange transition-colors"
                    />
                    <div className="relative">
                      <select className="w-full sm:w-auto h-11 sm:h-12 rounded-xl border border-gray-200 px-3 sm:px-4 pr-8 text-sm bg-white text-gray-900 appearance-none focus:outline-none focus:border-afrilink-orange transition-colors">
                        <option>€ EUR</option>
                        <option>CFA</option>
                        <option>USD</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Solde suggéré basé sur votre engagement mensuel
                  </p>
                </div>

                {/* Mode de paiement */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">
                    Mode de paiement
                  </label>
                  <PaymentMethodsGrid selected={method} onSelect={setMethod} />
                </div>
              </div>
            </div>

            {/* Info solde */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 sm:p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-blue-700">
                  Solde disponible Portefeuille: <span className="font-semibold">12 450,00 €</span>
                </p>
                <p className="text-[11px] text-blue-500 mt-1">
                  Débit automatique lors de la confirmation du versement.
                </p>
              </div>
            </div>

            {/* Bouton confirmer */}
            <button
              onClick={handleConfirm}
              className="w-full h-12 rounded-xl bg-afrilink-green hover:bg-afrilink-greenHover text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
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
