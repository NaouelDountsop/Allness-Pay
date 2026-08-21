import { useState } from 'react';
import { X, CheckCircle2, Copy, Check } from 'lucide-react';
import type { WalletTransaction } from '../../lib/api/transaction.service';
import { transactionService } from '../../lib/api/transaction.service';

function fmt(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

function operatorIcon(op: string | null): string {
  if (!op) return '💰';
  const icons: Record<string, string> = {
    MTN_MOMO: '📱',
    ORANGE_MONEY: '🟠',
    WAVE: '🌊',
    FREE_MONEY: '🔵',
    MOOV_MONEY: '🟡',
    AIRTEL_MONEY: '🔴',
    BANK_APP: '🏦',
  };
  return icons[op] ?? '💰';
}

export function TransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction: WalletTransaction;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const credit = transactionService.isCredit(transaction.type);
  const typeLabel = transactionService.getTypeLabel(transaction.type);
  const ok = transaction.status === 'completed';
  const fail = transaction.status === 'failed';
  const dt = new Date(transaction.createdAt);
  const dateStr = dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const handleCopy = () => {
    const text = transaction.reference ?? transaction.id;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSenderInfo = () => {
    if (credit) {
      // Deposit: the sender is the mobile money user
      if (transaction.type === 'deposit') {
        return {
          name: transactionService.getOperatorLabel(transaction.operator) || 'Mobile Money',
          phone: transaction.phoneNumber ?? '—',
          sub: transaction.operator ? transactionService.getOperatorLabel(transaction.operator) : 'Paiement externe',
        };
      }
      // Transfer received: the sender is the counterparty
      if (transaction.type === 'transfer_in') {
        return {
          name: transaction.counterpartyName ?? 'Expéditeur inconnu',
          phone: transaction.counterpartyPhone ?? '—',
          sub: 'Transfert interne',
        };
      }
    }
    return null;
  };

  const getRecipientInfo = () => {
    if (!credit) {
      // Transfer sent: the recipient is the counterparty
      if (transaction.type === 'transfer_out') {
        return {
          name: transaction.counterpartyName ?? 'Bénéficiaire inconnu',
          phone: transaction.counterpartyPhone ?? '—',
          sub: 'Transfert interne',
        };
      }
      // Withdrawal: the recipient is the mobile money user
      if (transaction.type === 'withdrawal') {
        return {
          name: transactionService.getOperatorLabel(transaction.operator) || 'Mobile Money',
          phone: transaction.phoneNumber ?? '—',
          sub: transaction.operator ? transactionService.getOperatorLabel(transaction.operator) : 'Retrait externe',
        };
      }
    }
    return null;
  };

  const sender = getSenderInfo();
  const recipient = getRecipientInfo();

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-allness-dark px-4 py-3 flex items-center justify-between shrink-0 rounded-t-2xl">
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <p className="text-white text-sm font-semibold">Détails</p>
          <div className="w-5" />
        </div>

        {/* Status + Montant */}
        <div className="bg-allness-dark px-5 pt-4 pb-6 text-center">
          <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${fail ? 'bg-red-500' : 'bg-allness-green'}`}>
            {fail ? <span className="text-white text-lg">✕</span> : <CheckCircle2 className="w-5 h-5 text-white" />}
          </div>
          <p className={`text-xs font-semibold mb-1 ${fail ? 'text-red-400' : 'text-allness-green'}`}>
            {ok ? 'Réussie' : transaction.status === 'pending' ? 'En attente' : 'Échouée'}
          </p>
          <p className="text-white text-2xl font-bold">
            {ok ? (credit ? '+' : '-') : ''}{fmt(transaction.amount)} <span className="text-sm font-medium text-white/60">XAF</span>
          </p>
          <p className="text-white/50 text-xs mt-1">{typeLabel} · {dateStr} {timeStr}</p>
        </div>

        {/* Contenu compact */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {/* Expéditeur (pour les crédits) */}
          {sender && (
            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
              <span className="text-xl">{operatorIcon(transaction.operator)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase">Expéditeur</p>
                <p className="text-sm font-medium text-allness-dark truncate">{sender.name}</p>
                <p className="text-[11px] text-gray-400">{sender.phone}</p>
              </div>
              {transaction.operator && (
                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
                  {sender.sub}
                </span>
              )}
            </div>
          )}

          {/* Destinataire (pour les débits) */}
          {recipient && (
            <div className="flex items-center gap-3 py-2 border-b border-gray-100">
              <span className="text-xl">{operatorIcon(transaction.operator)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase">Destinataire</p>
                <p className="text-sm font-medium text-allness-dark truncate">{recipient.name}</p>
                <p className="text-[11px] text-gray-400">{recipient.phone}</p>
              </div>
              {transaction.operator && (
                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
                  {recipient.sub}
                </span>
              )}
            </div>
          )}

          {/* Montant */}
          <div className="space-y-2 py-2 border-b border-gray-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Montant</span>
              <span className="font-medium text-allness-dark">{fmt(transaction.amount)} XAF</span>
            </div>
            <div className="flex justify-between text-xs font-semibold pt-1 border-t border-gray-100">
              <span className="text-allness-dark">Total</span>
              <span className="text-allness-dark">{fmt(transaction.amount)} XAF</span>
            </div>
          </div>

          {/* Infos */}
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Référence</span>
              <div className="flex items-center gap-1">
                <span className="font-medium text-allness-dark">{transaction.reference ?? transaction.id.slice(0, 12)}</span>
                <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600" title="Copier">
                  {copied ? <Check className="w-3 h-3 text-allness-green" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            {transaction.description && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Motif</span>
                <span className="font-medium text-allness-dark text-right max-w-[200px] truncate">{transaction.description}</span>
              </div>
            )}
            {transaction.provider && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Fournisseur</span>
                <span className="font-medium text-allness-dark">{transaction.provider}</span>
              </div>
            )}
            {transaction.phoneNumber && transaction.type !== 'deposit' && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Téléphone</span>
                <span className="font-medium text-allness-dark">{transaction.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-4 py-3">
          <button onClick={onClose} className="w-full h-9 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
