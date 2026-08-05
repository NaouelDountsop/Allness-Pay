import { useNavigate } from "react-router-dom";
import { Info, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { DepositStepper } from "../../components/ui/deposit-stepper";
import { useDepositFlow, type MobileMoneyOperator  } from "../../context/deposit-flow-context";


const OPERATORS: { key: MobileMoneyOperator; label: string; image: string }[] = [
  { key: "mtn", label: "MTN Mobile Money", image: "/mtn-momo.png" },
  { key: "orange", label: "Orange Money", image: "/orange-money.png" },
];

export default function InitiateDepositPage() {
  const navigate = useNavigate();
  const { deposit, setOperator, setPhoneNumber, setAmount, setDescription, submitDepositRequest } =
    useDepositFlow();

  const canSubmit = deposit.operator && deposit.phoneNumber.trim().length >= 9 && Number(deposit.amount) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    submitDepositRequest();
    // TODO: brancher sur POST /wallets/deposits (DepositsService.initiateDeposit)
    navigate("/deposit/request-sent");
  };

  return (
    <DashboardLayout>
      <DashboardHeader />
      <DepositStepper current={1} />

      <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-20 md:pb-10">
      <div className="w-full max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-afrilink-dark mb-2">Initier le dépôt</h1>
        <p className="text-sm text-gray-500 mb-6 sm:mb-8">
          Saisissez les informations ci-dessous pour initier une demande de dépôt sur votre
          portefeuille via Mobile Money.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Opérateur</label>
              <div className="grid grid-cols-2 gap-3">
                {OPERATORS.map((op) => (
                  <button
                    key={op.key}
                    onClick={() => setOperator(op.key)}
                    className={`relative flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left transition-colors ${
                      deposit.operator === op.key
                        ? "border-afrilink-green bg-green-50/40"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <img src={op.image} alt={op.label} className="w-7 h-7 object-contain" />
                    <span className="text-xs font-medium text-afrilink-dark">{op.label}</span>
                    {deposit.operator === op.key && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-afrilink-green" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Numéro de téléphone</label>
              <div className="flex items-center h-11 rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-afrilink-orange">
                <span className="flex items-center gap-1.5 px-3 h-full bg-gray-50 border-r border-gray-200 text-sm text-gray-600 shrink-0">
                  🇨🇲 +237
                </span>
                <input
                  type="tel"
                  value={deposit.phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="6 70 00 00 00"
                  className="flex-1 h-full px-3 text-sm text-afrilink-dark focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Montant à déposer</label>
              <div className="flex items-center h-11 rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-afrilink-orange">
                <input
                  type="number"
                  value={deposit.amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5 000"
                  className="flex-1 h-full px-3 text-sm text-afrilink-dark focus:outline-none"
                />
                <span className="px-3 text-xs text-gray-400 shrink-0">FCFA</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Description (optionnelle)</label>
              <input
                type="text"
                value={deposit.description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dépôt AfriLinkPay"
                className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-green-50 border border-green-100 p-4 mb-6">
            <Info className="w-4 h-4 text-afrilink-green shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">
              Vous recevrez une notification sur votre téléphone pour confirmer ce paiement.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity
              bg-afrilink-orange text-white hover:opacity-90
              disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-100"
          >
            Recevoir une demande de confirmation
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
