import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Copy, Info, CheckCircle2, ArrowLeft, Building2 } from "lucide-react";
import { DashboardLayout } from "@/components/user_dashboard/dash-layout";
import { DashboardHeader } from "@/components/user_dashboard/header";
import { useDepositFlow } from "../../context/deposit-flow-context";
import { BANK_LABELS } from "../../context/deposit-flow.constants";

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone || '6 70 ** ** **';
  return `${digits.slice(0, 1)} ${digits.slice(1, 3)} ** ** **`;
}

function maskIban(iban: string) {
  const clean = iban.replace(/\s/g, '');
  if (clean.length <= 8) return iban;
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${'*'.repeat(4)} ${'*'.repeat(4)}`;
}

export default function RequestSentPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { deposit } = useDepositFlow();
  const isBank = deposit.method === 'bank';

  // For mobile money: auto-redirect to phone confirmation after 3s.
  // For bank deposits: auto-redirect to processing (no phone confirmation needed).
  useEffect(() => {
    const target = isBank ? '/deposit/processing' : '/deposit/confirm';
    const timer = setTimeout(() => navigate(target), 3000);
    return () => clearTimeout(timer);
  }, [navigate, isBank]);

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
          <h1 className="text-xl sm:text-2xl font-bold text-allness-dark">{t('requestSent.pageTitle')}</h1>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-[52px]">
          {isBank
            ? t('requestSent.descriptionBank')
            : t('requestSent.descriptionMobile')}
        </p>

        {isBank ? (
          /* ── Bank deposit: transfer instructions ── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 mb-5">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-600" />
              </span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">{t('requestSent.transferTo')}</p>
                <p className="text-sm font-medium text-allness-dark">
                  {BANK_LABELS[deposit.bankName] || deposit.bankName}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-2xl font-bold text-allness-dark">
                {deposit.amount || '5 000'} FCFA
              </p>
              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-allness-orange text-[11px] font-semibold">
                {t('requestSent.pendingStatus')}
              </span>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t('requestSent.transferInfo')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('requestSent.bankLabel')}</span>
                  <span className="text-xs font-medium text-allness-dark">
                    {BANK_LABELS[deposit.bankName] || deposit.bankName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('requestSent.ibanLabel')}</span>
                  <span className="text-xs font-mono font-medium text-allness-dark">
                    {maskIban(deposit.iban)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('requestSent.holderLabel')}</span>
                  <span className="text-xs font-medium text-allness-dark">
                    {deposit.accountHolder}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t('requestSent.amountLabel')}</span>
                  <span className="text-sm font-bold text-allness-dark">
                    {new Intl.NumberFormat('fr-FR').format(Number(deposit.amount))} FCFA
                  </span>
                </div>
                {deposit.description && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t('requestSent.descriptionLabel')}</span>
                    <span className="text-xs text-allness-dark">{deposit.description}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-[11px] text-gray-400 mb-1">{t('requestSent.reference')}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-gray-600">{deposit.transactionId || deposit.reference}</p>
                <button className="text-gray-300 hover:text-allness-dark" aria-label="Copier">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Mobile Money: original content ── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 mb-5">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-12 rounded-full border-2 border-dashed border-allness-orange flex items-center justify-center shrink-0 animate-spin [animation-duration:3s]">
                <span className="w-2 h-2 rounded-full bg-allness-orange" />
              </span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">{t('requestSent.requestSentTo')}</p>
                <p className="text-sm font-medium text-allness-dark">
                  +237 {maskPhone(deposit.phoneNumber)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-2xl font-bold text-allness-dark">
                {deposit.amount || '5 000'} FCFA
              </p>
              <span className="px-2.5 py-1 rounded-full bg-orange-50 text-allness-orange text-[11px] font-semibold">
                {t('requestSent.pendingStatus')}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-[11px] text-gray-400 mb-1">{t('requestSent.reference')}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-gray-600">{deposit.transactionId || deposit.reference}</p>
                <button className="text-gray-300 hover:text-allness-dark" aria-label="Copier">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-[1fr_260px] gap-6">
          <div>
            <p className="text-sm font-semibold text-allness-dark mb-4">{t('requestSent.transactionTracking')}</p>
            <div className="flex flex-col gap-4">
              {isBank ? (
                <>
                  <TimelineItem
                    label={t('requestSent.timeline.bankRecorded')}
                    status="done"
                    hint={t('requestSent.timelineHint.now')}
                  />
                  <TimelineItem
                    label={t('requestSent.timeline.bankPending')}
                    status="active"
                    hint={t('requestSent.timelineHint.actionBank')}
                  />
                  <TimelineItem label={t('requestSent.timeline.bankVerify')} status="pending" hint={t('requestSent.timelineHint.pending')} />
                  <TimelineItem label={t('requestSent.timeline.bankCredit')} status="pending" hint={t('requestSent.timelineHint.pending')} />
                </>
              ) : (
                <>
                  <TimelineItem label={t('requestSent.timeline.mobileSent')} status="done" hint={t('requestSent.timelineHint.now')} />
                  <TimelineItem label={t('requestSent.timeline.mobileNotification')} status="active" hint={t('requestSent.timelineHint.pending')} />
                  <TimelineItem
                    label={t('requestSent.timeline.mobileConfirm')}
                    status="pending"
                    hint={t('requestSent.timelineHint.pending')}
                  />
                  <TimelineItem label={t('requestSent.timeline.mobileCredit')} status="pending" hint={t('requestSent.timelineHint.pending')} />
                </>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 p-4 h-fit">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-600 leading-relaxed">
              {isBank
                ? t('requestSent.infoBank')
                : t('requestSent.infoMobile')}
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
  status: 'done' | 'active' | 'pending';
}) {
  return (
    <div className="flex items-center gap-3">
      {status === 'done' ? (
        <CheckCircle2 className="w-4.5 h-4.5 text-allness-green shrink-0" />
      ) : (
        <span
          className={`w-4.5 h-4.5 rounded-full border-2 shrink-0 ${
            status === 'active' ? 'border-allness-orange bg-orange-50' : 'border-gray-200'
          }`}
        />
      )}
      <div>
        <p
          className={`text-xs font-medium ${status === 'pending' ? 'text-gray-400' : 'text-allness-dark'}`}
        >
          {label}
        </p>
        <p className="text-[11px] text-gray-400">{hint}</p>
      </div>
    </div>
  );
}
