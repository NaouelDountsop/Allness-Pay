import {
  X,
  Download,
  ArrowLeftRight,
  CreditCard,
  Info,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import jsPDF from 'jspdf';

import { Dialog, DialogContent, DialogFooter } from '../../components/ui/dialog';
import type { WalletTransaction } from '../../lib/api/transaction.service';
import { transactionService } from '../../lib/api/transaction.service';
import { formatAmount } from '../../lib/utils';

function downloadPdf(
  transaction: WalletTransaction,
  currency: string | undefined,
  senderName: string,
  recipientName: string,
  statusLabel: string,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ref = transaction.reference ?? transaction.id.slice(0, 12);
  const date = new Date(transaction.createdAt);
  const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  const center = pageW / 2;

  // Brand colors
  const dark = [13, 52, 58] as const;
  const orange = [210, 142, 47] as const;
  const green = [0, 132, 90] as const;
  const white = [255, 255, 255] as const;
  const grayBg = [246, 247, 249] as const;
  const grayText = [120, 120, 120] as const;
  const darkText = [30, 30, 30] as const;

  let y = 0;

  // ── HEADER ──
  doc.setFillColor(...dark);
  doc.roundedRect(0, 0, pageW, 38, 0, 0, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...orange);
  doc.text('ALLNESS PAY', margin, 10);

  doc.setFontSize(18);
  doc.setTextColor(...white);
  doc.text('Transaction', margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(`${dateStr} a ${timeStr}`, margin, 27);

  // Status badge
  const statusW = doc.getStringUnitWidth(statusLabel) * 9 * 0.352778 + 8;
  doc.setFillColor(...green);
  doc.roundedRect(margin, 30, statusW, 5.5, 2.75, 2.75, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...white);
  doc.text(statusLabel, margin + 4, 33.5);

  y = 44;

  // ── MONTANT SECTION ──
  doc.setDrawColor(200);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.roundedRect(margin, y, contentW, 20, 2, 2, 'S');
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...orange);
  doc.text('MONTANT', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayText);
  doc.text('Montant', margin + 6, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkText);
  doc.text(formatAmount(transaction.amount, currency), margin + 6, y + 18);

  if (transaction.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grayText);
    doc.text('Description', center + 5, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...darkText);
    doc.text(transaction.description, center + 5, y + 18);
  }

  y += 26;

  // ── EXPEDITEUR & BENEFICIAIRE SECTION ──
  const senderVal = senderName;
  const recipientVal = `${recipientName}${transaction.phoneNumber ? ` (${transaction.phoneNumber})` : ''}`;
  const fields = [
    { label: 'Expediteur', value: senderVal },
    { label: 'Beneficiaire', value: recipientVal },
    { label: 'Mode de reception', value: (transaction.type === 'transfer_in' || transaction.type === 'transfer_out') ? 'Allness Pay' : (transaction.provider ?? 'Mobile Money') },
  ];
  const sectionH = 28;
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentW, sectionH, 2, 2, 'S');
  doc.setLineWidth(0.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...orange);
  doc.text('EXPEDITEUR & BENEFICIAIRE', margin + 6, y + 7);

  let fy = y + 13;
  for (const f of fields) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...grayText);
    doc.text(f.label, margin + 6, fy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...darkText);
    doc.text(f.value, margin + 50, fy);
    fy += 5;
  }

  y += sectionH + 6;

  // ── HISTORIQUE DU STATUT ──
  const histH = 32;
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(margin, y, contentW, histH, 2, 2, 'F');
  doc.setDrawColor(209, 250, 229);
  doc.roundedRect(margin, y, contentW, histH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(79, 70, 229);
  doc.text('HISTORIQUE DU STATUT', margin + 6, y + 7);

  const isCompleted = transaction.status === 'completed';
  const history = [
    { label: 'Initie', time: timeStr },
    { label: 'Fonds envoyes', time: timeStr },
    { label: isCompleted ? 'Recu par le beneficiaire' : statusLabel, time: timeStr },
  ];
  let hy = y + 13;
  for (const h of history) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...darkText);
    doc.text(h.label, margin + 6, hy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...grayText);
    doc.text(h.time, pageW - margin - 10, hy, { align: 'right' });
    hy += 6;
  }

  y += histH + 8;

  // ── FOOTER ──
  doc.setFillColor(...grayBg);
  doc.roundedRect(0, y, pageW, 14, 0, 0, 'F');
  doc.setDrawColor(220);
  doc.line(0, y, pageW, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...grayText);
  doc.text(`Recu genere automatiquement par Allness Pay`, margin, y + 6);
  doc.text(`ID: ${transaction.id}`, margin, y + 10);

  doc.save(`recu-${ref}.pdf`);
}

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'COMPLÉTÉ',
  completed: 'COMPLÉTÉ',
  PENDING: 'EN ATTENTE',
  pending: 'EN ATTENTE',
  FAILED: 'ÉCHOUÉE',
  failed: 'ÉCHOUÉE',
  CANCELLED: 'ANNULÉE',
  cancelled: 'ANNULÉE',
};

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function SectionTitle({ icon: Icon, children }: { icon: typeof ArrowLeftRight; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-allness-orange shrink-0" />
      <p className="text-[11px] font-bold uppercase tracking-wide text-allness-orange">{children}</p>
    </div>
  );
}

function Field({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-sm text-allness-dark break-words ${bold ? 'font-bold' : 'font-semibold'}`}>{value}</p>
    </div>
  );
}

export function TransactionDetailModal({
  transaction,
  currency,
  onClose,
}: {
  transaction: WalletTransaction;
  currency?: string | null;
  onClose: () => void;
}) {
  const statusLabel = STATUS_LABELS[transaction.status] ?? transaction.status;
  const isCompleted = transaction.status === 'completed';
  const curr = currency ?? undefined;

  const isCredit = transactionService.isCredit(transaction.type);
  const senderName = isCredit
    ? (transaction.counterpartyName ?? transactionService.getOperatorLabel(transaction.operator) ?? '—')
    : 'Vous';
  const recipientName = isCredit
    ? 'Vous'
    : (transaction.counterpartyName ?? '—');
  const receptionMode = (transaction.type === 'transfer_in' || transaction.type === 'transfer_out')
    ? 'Allness Pay'
    : (transaction.provider ?? 'Mobile Money');

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent
        hideHeader
        className="w-[calc(100%-12px)] max-w-[640px] p-0 overflow-hidden rounded-2xl border-2 border-blue-600 shadow-2xl bg-white gap-0"
      >
        {/* HEADER */}
        <div className="relative bg-allness-dark px-4 py-3">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 w-7 h-7 rounded-md border border-dashed border-blue-400/70 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="border border-dashed border-white/30 rounded-lg px-3.5 py-3 pr-12 inline-block max-w-full">
            <h2 className="text-lg font-bold text-allness-orange mb-1.5 break-words">Transaction</h2>

            <div className="flex items-center gap-1.5 text-xs text-white/70 mb-2.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {fmtDateTime(transaction.createdAt)}
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-emerald-300/60 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              {statusLabel}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-3 py-3 space-y-3 bg-white max-h-[70vh] overflow-y-auto overflow-x-hidden">
          {/* Montant */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 px-3 py-3">
            <SectionTitle icon={CreditCard}>Montant</SectionTitle>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-6 gap-y-3">
              <Field label="Montant" value={formatAmount(transaction.amount, curr)} bold />
              <Field label="Description" value={transaction.description ?? '—'} />
            </div>
          </div>

          {/* Expéditeur & bénéficiaire */}
          <div className="rounded-xl border-2 border-gray-800 px-3 py-3">
            <SectionTitle icon={ArrowLeftRight}>Expéditeur & bénéficiaire</SectionTitle>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 mb-2.5">
              <Field label="Expéditeur" value={senderName} />
              <Field
                label="Bénéficiaire"
                value={`${recipientName}${transaction.phoneNumber ? ` (${transaction.phoneNumber})` : ''}`}
              />
            </div>
            <div className="pt-2.5 border-t border-gray-100">
              <Field label="Mode de réception" value={receptionMode} />
            </div>
          </div>

          {/* Historique du statut */}
          <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 px-3 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-600 mb-3">Historique du statut</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700">Initié</span>
                <span className="text-xs text-gray-400 shrink-0">{fmtTime(transaction.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700">Fonds envoyés</span>
                <span className="text-xs text-gray-400 shrink-0">{fmtTime(transaction.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={`text-sm font-semibold ${isCompleted ? 'text-allness-green' : 'text-gray-500'}`}>
                  {isCompleted ? 'Reçu par le bénéficiaire' : statusLabel}
                </span>
                <span className="text-xs text-gray-400 shrink-0">{fmtTime(transaction.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter>
          <div className="px-3 py-2.5 border-t border-gray-100 bg-slate-50 flex flex-wrap items-center gap-2 w-full">
            <button
              onClick={() => downloadPdf(transaction, curr, senderName, recipientName, statusLabel)}
              className="h-9 px-3.5 rounded-lg bg-allness-green text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition flex-1 min-w-[9.5rem]"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              Télécharger le reçu
            </button>

            <button className="h-9 px-3.5 rounded-lg border border-gray-300 bg-white text-gray-600 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-gray-50 transition flex-1 min-w-[9rem]">
              <Info className="w-3.5 h-3.5 shrink-0" />
              Signaler un litige
            </button>

            <div className="flex-1 basis-0 hidden sm:block" />

            <button
              onClick={onClose}
              className="h-9 px-5 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:opacity-90 transition flex-1 sm:flex-none min-w-[6rem]"
            >
              Fermer
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
