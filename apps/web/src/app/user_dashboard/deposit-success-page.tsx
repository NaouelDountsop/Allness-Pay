import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Eye, ArrowRight, Download, ArrowLeft, Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { useDepositFlow } from "../../context/deposit-flow-context";
import { BANK_LABELS } from "../../context/deposit-flow.constants";

function formatDate(date: Date | null) {
  if (!date) return '—';
  return (
    date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' à ' +
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
}

const MOBILE_OPERATOR_LABEL: Record<string, string> = {
  mtn: 'MTN Mobile Money',
  orange: 'Orange Money',
};

export default function DepositSuccessPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { deposit, reset } = useDepositFlow();
  const isBank = deposit.method === 'bank';

  const handleBackToWallet = () => {
    reset();
    navigate('/dashboard/wallet');
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-allness-orange/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-allness-orange" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-allness-dark">{t('depositSuccess.title')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {t('depositSuccess.description')}
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-10">
          <div className="flex justify-center mb-8">
            <span className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-11 h-11 text-allness-green" />
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400">{t('depositSuccess.amountCredited')}</span>
              <span className="text-lg font-bold text-allness-green">
                +{new Intl.NumberFormat('fr-FR').format(Number(deposit.amount))} FCFA
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">{t('depositSuccess.reference')}</span>
              <span className="text-xs font-mono text-allness-dark">
                {deposit.transactionId || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">{t('depositSuccess.date')}</span>
              <span className="text-xs text-allness-dark">{formatDate(deposit.createdAt)}</span>
            </div>

            {isBank ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">{t('depositSuccess.bank')}</span>
                  <span className="text-xs text-allness-dark flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {BANK_LABELS[deposit.bankName] || deposit.bankName}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">{t('depositSuccess.holder')}</span>
                  <span className="text-xs text-allness-dark">{deposit.accountHolder}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{t('depositSuccess.operator')}</span>
                <span className="text-xs text-allness-dark">
                  {MOBILE_OPERATOR_LABEL[deposit.operator]}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{t('depositSuccess.status')}</span>
              <span className="text-xs font-semibold text-allness-green">{t('depositSuccess.success')}</span>
            </div>
          </div>

          <div className="rounded-xl bg-green-50 border border-green-100 p-4 flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] text-green-700 mb-1">{t('depositSuccess.amountDeposited')}</p>
              <p className="text-lg font-bold text-allness-dark">
                {new Intl.NumberFormat('fr-FR').format(Number(deposit.amount))} FCFA
              </p>
            </div>
            <Eye className="w-4 h-4 text-green-600" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleBackToWallet}
              className="h-12 rounded-lg bg-allness-green text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              {t('depositSuccess.backToWallet')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const rows = [
                  ['Champ', 'Valeur'],
                  ['Montant', `${new Intl.NumberFormat('fr-FR').format(Number(deposit.amount))} FCFA`],
                  ['Référence', deposit.transactionId || '—'],
                  ['Date', formatDate(deposit.createdAt)],
                  ['Statut', 'Succès'],
                  ['Méthode', isBank ? `Virement bancaire` : (MOBILE_OPERATOR_LABEL[deposit.operator] || deposit.operator)],
                ];
                if (isBank) {
                  rows.push(['Banque', BANK_LABELS[deposit.bankName] || deposit.bankName]);
                  rows.push(['Titulaire', deposit.accountHolder]);
                }
                const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `recu-depot-${deposit.transactionId || 'recu'}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="h-11 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('depositSuccess.downloadReceipt')}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
