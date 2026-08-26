import { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  X,
  Copy,
  Check,
  Wallet,
  Tag,
  FileText,
  MessageSquare,
  Users,
  CreditCard,
  Download,
  Calendar,
  Loader2,
} from 'lucide-react';
import type { WalletTransaction } from '../../lib/api/transaction.service';
import { transactionService } from '../../lib/api/transaction.service';

// Champs optionnels liés aux tontines / à la source wallet.
// À terme, ces champs devraient être ajoutés directement à l'interface
// WalletTransaction dans transaction.service.ts si l'API les renvoie systématiquement.
interface TontineTransactionFields {
  tontineName?: string;
  tontineCycle?: string | number;
  walletName?: string;
  walletNumber?: string;
  fees?: number;
}

type ExtendedWalletTransaction = WalletTransaction & TontineTransactionFields;

function fmt(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

// Petits points décoratifs dans le header, comme sur la maquette
const CONFETTI = [
  { top: '10%', left: '8%', size: 5, color: '#22c55e', opacity: 0.5 },
  { top: '65%', left: '5%', size: 4, color: '#f59e0b', opacity: 0.5 },
  { top: '20%', left: '88%', size: 4, color: '#f59e0b', opacity: 0.6 },
  { top: '55%', left: '92%', size: 6, color: '#22c55e', opacity: 0.4 },
  { top: '80%', left: '18%', size: 3, color: '#ffffff', opacity: 0.3 },
  { top: '15%', left: '45%', size: 3, color: '#ffffff', opacity: 0.25 },
  { top: '75%', left: '78%', size: 3, color: '#f59e0b', opacity: 0.4 },
];

export function TransactionDetailModal({
  transaction,
  onClose,
  onDownloadReceipt,
}: {
  transaction: ExtendedWalletTransaction;
  onClose: () => void;
  onDownloadReceipt?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const credit = transactionService.isCredit(transaction.type);
  const typeLabel = transactionService.getTypeLabel(transaction.type);
  const ok = transaction.status === 'completed';
  const fail = transaction.status === 'failed';
  const dt = new Date(transaction.createdAt);
  const dateStr = dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Champs optionnels (tontine / source wallet)
  const { tontineName, tontineCycle, walletName, walletNumber, fees } = transaction;

  const handleCopy = () => {
    const text = transaction.reference ?? transaction.id;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPartyInfo = () => {
    if (credit) {
      if (transaction.type === 'deposit') {
        return {
          label: 'EXPÉDITEUR',
          name: transactionService.getOperatorLabel(transaction.operator) || 'Mobile Money',
          phone: transaction.phoneNumber ?? '—',
        };
      }
      if (transaction.type === 'transfer_in') {
        return {
          label: 'EXPÉDITEUR',
          name: transaction.counterpartyName ?? 'Expéditeur inconnu',
          phone: transaction.counterpartyPhone ?? '—',
        };
      }
    } else {
      if (transaction.type === 'transfer_out') {
        return {
          label: 'DESTINATAIRE',
          name: transaction.counterpartyName ?? 'Bénéficiaire inconnu',
          phone: transaction.counterpartyPhone ?? '—',
        };
      }
      if (transaction.type === 'withdrawal') {
        return {
          label: 'DESTINATAIRE',
          name: transactionService.getOperatorLabel(transaction.operator) || 'Mobile Money',
          phone: transaction.phoneNumber ?? '—',
        };
      }
    }
    return null;
  };

  const party = getPartyInfo();
  const total = transaction.amount + (fees ?? 0);

  // Génère le PDF du reçu côté client et déclenche le téléchargement
  const buildReceiptPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 190] });
    const pageWidth = 80;
    const centerX = pageWidth / 2;
    const DARK: [number, number, number] = [15, 42, 46];
    const GREEN: [number, number, number] = [16, 185, 129];
    const RED: [number, number, number] = [239, 68, 68];
    const GRAY: [number, number, number] = [156, 163, 175];
    const TEXT: [number, number, number] = [17, 24, 39];

    // Bandeau d'en-tête
    doc.setFillColor(...DARK);
    doc.rect(0, 0, pageWidth, 55, 'F');

    doc.setFillColor(...(fail ? RED : GREEN));
    doc.circle(centerX, 14, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(fail ? 'X' : '✓', centerX, 15.5, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(...(fail ? RED : GREEN));
    doc.text(ok ? 'Réussie' : transaction.status === 'pending' ? 'En attente' : 'Échouée', centerX, 24, {
      align: 'center',
    });

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${ok ? (credit ? '+' : '-') : ''}${fmt(transaction.amount)} XAF`,
      centerX,
      32,
      { align: 'center' },
    );

    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    doc.text(typeLabel, centerX, 38, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`${dateStr} à ${timeStr}`, centerX, 43, { align: 'center' });

    // Corps du reçu
    let y = 63;
    const left = 6;
    const right = pageWidth - 6;
    doc.setTextColor(...TEXT);

    const addRow = (label: string, value: string, opts?: { bold?: boolean; valueColor?: [number, number, number] }) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
      doc.setTextColor(...TEXT);
      doc.text(label, left, y);
      doc.setTextColor(...(opts?.valueColor ?? TEXT));
      doc.text(value, right, y, { align: 'right' });
      y += 6;
    };

    const addSeparator = () => {
      doc.setDrawColor(230, 230, 230);
      doc.line(left, y, right, y);
      y += 5;
    };

    const addSectionLabel = (label: string) => {
      doc.setFontSize(7.5);
      doc.setTextColor(...GRAY);
      doc.setFont('helvetica', 'normal');
      doc.text(label.toUpperCase(), left, y);
      y += 5;
    };

    if (party) {
      addSectionLabel(party.label);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEXT);
      doc.text(party.name, left, y);
      y += 5;
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.text(party.phone, left, y);
      y += 7;
      addSeparator();
    }

    addSectionLabel('Détail du paiement');
    addRow('Montant', `${fmt(transaction.amount)} XAF`);
    addRow('Frais de transaction', fees ? `${fmt(fees)} XAF` : 'Gratuit', { valueColor: GREEN });
    addSeparator();

    addRow('Total', `${fmt(total)} XAF`, { bold: true });
    addSeparator();

    addSectionLabel('Référence');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT);
    doc.text(transaction.reference ?? transaction.id, left, y);
    y += 7;
    addSeparator();

    if (transaction.description) {
      addSectionLabel('Motif');
      doc.setFontSize(9);
      doc.setTextColor(...TEXT);
      doc.text(doc.splitTextToSize(transaction.description, pageWidth - 12), left, y);
      y += 9;
      addSeparator();
    }

    if (tontineName) {
      addSectionLabel('Tontine');
      addRow(tontineName, tontineCycle ? `Cycle ${tontineCycle}` : '');
      addSeparator();
    }

    if (walletName) {
      addSectionLabel('Source');
      doc.setFontSize(9);
      doc.setTextColor(...TEXT);
      doc.text(walletName, left, y);
      y += 5;
      if (walletNumber) {
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY);
        doc.text(walletNumber, left, y);
        y += 6;
      }
    }

    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text('Généré par AllnessPay', centerX, 184, { align: 'center' });

    return doc;
  };

  const handleDownloadReceipt = async () => {
    if (downloading) return;

    if (onDownloadReceipt) {
      onDownloadReceipt();
      return;
    }

    setDownloading(true);
    try {
      const doc = buildReceiptPdf();
      const filename = `recu-${(transaction.reference ?? transaction.id).slice(0, 12)}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Erreur lors de la génération du reçu :', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white flex flex-col max-h-[90vh] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header sombre : titre + statut + montant */}
        <div className="relative bg-allness-dark px-4 pt-3 pb-9 shrink-0 overflow-hidden">
          {/* Confettis décoratifs */}
          <div className="absolute inset-0 pointer-events-none">
            {CONFETTI.map((c, i) => (
              <span
                key={i}
                className="absolute rounded-full"
                style={{
                  top: c.top,
                  left: c.left,
                  width: c.size,
                  height: c.size,
                  backgroundColor: c.color,
                  opacity: c.opacity,
                }}
              />
            ))}
          </div>

          <div className="relative flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <p className="text-white text-base font-semibold">Détails</p>
            <div className="w-5" />
          </div>

          <div className="relative text-center">
            <div
              className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                fail ? 'bg-red-500' : 'bg-emerald-500'
              }`}
            >
              {fail ? <span className="text-white text-xl">✕</span> : <Check className="w-6 h-6 text-white" strokeWidth={3} />}
            </div>
            <p className={`text-sm font-semibold mb-1 ${fail ? 'text-red-400' : 'text-emerald-400'}`}>
              {ok ? 'Réussie' : transaction.status === 'pending' ? 'En attente' : 'Échouée'}
            </p>
            <p className="text-white text-4xl font-bold leading-tight">
              {ok ? (credit ? '+' : '-') : ''}
              {fmt(transaction.amount)} <span className="text-lg font-medium text-white/50">XAF</span>
            </p>
            <p className="text-white/70 text-sm mt-1">{typeLabel}</p>
            <p className="text-white/50 text-xs mt-2 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {dateStr} à {timeStr}
            </p>
          </div>
        </div>

        {/* Carte blanche arrondie superposée */}
        <div className="bg-white rounded-t-3xl -mt-5 relative z-10 flex-1 overflow-y-auto px-4 pt-5 pb-2 space-y-4">
          {/* Expéditeur / Destinataire */}
          {party && (
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm font-bold">
                  {initials(party.name)}
                </div>
                {ok && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{party.label}</p>
                <p className="text-base font-semibold text-allness-dark truncate">{party.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{party.phone}</p>
              </div>
            </div>
          )}

          {/* Détail du paiement */}
          <div className="pb-4 border-b border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2.5">Détail du paiement</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-500">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  Montant
                </span>
                <span className="font-medium text-allness-dark">{fmt(transaction.amount)} XAF</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-500">
                  <Tag className="w-4 h-4 text-amber-500" />
                  Frais de transaction
                </span>
                <span className="font-medium text-emerald-500">{fees ? `${fmt(fees)} XAF` : 'Gratuit'}</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <span className="text-[15px] font-bold text-allness-dark">Total</span>
            <span className="text-[15px] font-bold text-allness-dark">{fmt(total)} XAF</span>
          </div>

          {/* Référence */}
          <div className="pb-4 border-b border-gray-100">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              Référence
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-allness-dark truncate">
                {(transaction.reference ?? transaction.id).slice(0, 8)}...
              </span>
              <button
                onClick={handleCopy}
                className="w-8 h-8 shrink-0 ml-2 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                title="Copier"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Motif */}
          {transaction.description && (
            <div className="pb-4 border-b border-gray-100">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                Motif
              </p>
              <p className="text-sm font-medium text-allness-dark">{transaction.description}</p>
            </div>
          )}

          {/* Tontine */}
          {tontineName && (
            <div className="pb-4 border-b border-gray-100">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                Tontine
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-allness-dark">{tontineName}</span>
                {tontineCycle && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 rounded-full px-2.5 py-1">
                    Cycle {tontineCycle}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Source */}
          {walletName && (
            <div className="pb-2">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                Source
              </p>
              <p className="text-sm font-medium text-allness-dark">{walletName}</p>
              {walletNumber && <p className="text-xs text-gray-400 mt-0.5">{walletNumber}</p>}
            </div>
          )}
        </div>

        {/* Footer : télécharger + fermer */}
        <div className="shrink-0 px-4 pt-3 pb-4 space-y-2.5 bg-white">
          <button
            onClick={handleDownloadReceipt}
            disabled={downloading}
            className="w-full h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? 'Génération...' : 'Télécharger le reçu'}
          </button>
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-allness-dark text-white text-[15px] font-semibold hover:opacity-90 transition-opacity"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}