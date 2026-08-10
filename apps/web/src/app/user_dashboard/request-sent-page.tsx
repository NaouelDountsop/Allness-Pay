import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Info, CheckCircle2, ArrowLeft, Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { useDepositFlow, BANK_LABELS } from "../../context/deposit-flow-context";

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone || "6 70 ** ** **";
  return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ** ** **`;
}

function maskIban(iban: string) {
  const clean = iban.replace(/\s/g, "");
  if (clean.length <= 8) return iban;
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${"*".repeat(4)} ${"*".repeat(4)}`;
}

export default function RequestSentPage() {
  const navigate = useNavigate();
  const { deposit } = useDepositFlow();
  const isBank = deposit.method === "bank";

  // For mobile money: auto-redirect to phone confirmation after 3s.
  // For bank deposits: auto-redirect to processing (no phone confirmation needed).
  useEffect(() => {
    const target = isBank ? "/deposit/processing" : "/deposit/confirm";
    const timer = setTimeout(() => navigate(target), 3000);
    return () => clearTimeout(timer);
  }, [navigate, isBank]);

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-afrilink-orange/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-afrilink-orange" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-afrilink-dark">Demande envoyée</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {isBank
            ? "Vos informations bancaires ont été enregistrées. Effectuez le virement pour finaliser la transaction."
            : "Votre demande de dépôt a été envoyée avec succès à votre téléphone. Veuillez confirmer le paiement pour finaliser la transaction."}
        </p>

        {isBank ? (
          /* ── Bank deposit: transfer instructions ── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 mb-5">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-600" />
              </span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Virement vers</p>
                <p className="text-sm font-medium text-afrilink-dark">
                  {BANK_LABELS[deposit.bankName] || deposit.bankName}
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

            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Informations de virement
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Banque</span>
                  <span className="text-xs font-medium text-afrilink-dark">
                    {BANK_LABELS[deposit.bankName] || deposit.bankName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">IBAN / Compte</span>
                  <span className="text-xs font-mono font-medium text-afrilink-dark">
                    {maskIban(deposit.iban)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Titulaire</span>
                  <span className="text-xs font-medium text-afrilink-dark">
                    {deposit.accountHolder}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Montant</span>
                  <span className="text-sm font-bold text-afrilink-dark">
                    {new Intl.NumberFormat("fr-FR").format(Number(deposit.amount))} FCFA
                  </span>
                </div>
                {deposit.description && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Description</span>
                    <span className="text-xs text-afrilink-dark">{deposit.description}</span>
                  </div>
                )}
              </div>
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
        ) : (
          /* ── Mobile Money: original content ── */
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
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-[1fr_260px] gap-6">
          <div>
            <p className="text-sm font-semibold text-afrilink-dark mb-4">Suivi de la transaction</p>
            <div className="flex flex-col gap-4">
              {isBank ? (
                <>
                  <TimelineItem label="Informations enregistrées" status="done" hint="À l'instant" />
                  <TimelineItem label="En attente du virement" status="active" hint="Effectuez le virement" />
                  <TimelineItem label="Vérification bancaire" status="pending" hint="En attente" />
                  <TimelineItem label="Crédit du portefeuille" status="pending" hint="En attente" />
                </>
              ) : (
                <>
                  <TimelineItem label="Demande envoyée" status="done" hint="À l'instant" />
                  <TimelineItem label="Notification en cours" status="active" hint="En attente" />
                  <TimelineItem label="Confirmation utilisateur" status="pending" hint="En attente" />
                  <TimelineItem label="Crédit du portefeuille" status="pending" hint="En attente" />
                </>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4 h-fit">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-600 leading-relaxed">
              {isBank
                ? "Effectuez un virement bancaire avec les informations affichées ci-dessus. Le crédit sera automatique dès réception confirmée par votre banque."
                : "Vous n'avez rien à faire pour le moment. Veuillez vérifier votre téléphone et confirmer le paiement Mobile Money."}
            </p>
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
