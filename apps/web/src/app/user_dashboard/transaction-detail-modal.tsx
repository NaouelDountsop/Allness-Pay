import { ArrowLeft, CheckCircle2, Phone, Share2, Copy, FileDown, Flag } from 'lucide-react';
import type { WalletTransaction } from '../../lib/api/transaction.service';
import { transactionService } from '../../lib/api/transaction.service';

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function TransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction: WalletTransaction;
  onClose: () => void;
}) {
  const credit = transactionService.isCredit(transaction.type);
  const typeLabel = transactionService.getTypeLabel(transaction.type);
  const fees = Math.round(transaction.amount * 0.01);

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-afrilink-dark px-4 py-4 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-white text-sm font-semibold">Détails de la transaction</p>
        <button className="text-white/70 hover:text-white transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Status + Amount */}
        <div className="bg-afrilink-dark px-6 pt-6 pb-10 text-center">
          <div className="w-14 h-14 rounded-full bg-afrilink-green mx-auto mb-3 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <p className="text-afrilink-green text-sm font-semibold mb-2">
            {transaction.status === 'completed' ? 'Transaction réussie' : transaction.status === 'pending' ? 'En attente' : 'Échouée'}
          </p>
          <p className="text-white text-3xl font-bold mb-1">
            {credit ? '+' : '-'} {formatAmount(transaction.amount)} <span className="text-lg font-medium text-white/60">XAF</span>
          </p>
          <p className="text-white/60 text-sm">{typeLabel}</p>
          <p className="text-white/40 text-xs mt-2">
            {formatDate(transaction.createdAt)} · {formatTime(transaction.createdAt)}
          </p>
        </div>

        <div className="px-4 -mt-6 relative z-10 space-y-4 pb-6">
          {/* Destinataire */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
              {credit ? 'Expéditeur' : 'Destinataire'}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-afrilink-dark flex items-center justify-center">
                  <span className="text-sm font-bold text-white">JD</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-afrilink-dark">John Doe</p>
                  <p className="text-xs text-gray-400">{transaction.phoneNumber ?? '+237 6XX XXX XXX'}</p>
                </div>
              </div>
              <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-afrilink-dark hover:border-gray-300 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Détails du paiement */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
              Détails du paiement
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Montant envoyé</span>
                <span className="text-xs font-medium text-afrilink-dark">{formatAmount(transaction.amount)} XAF</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Frais de transaction</span>
                <span className="text-xs font-medium text-afrilink-dark">{formatAmount(fees)} XAF</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-afrilink-dark">Total débité</span>
                <span className="text-sm font-bold text-afrilink-dark">{formatAmount(transaction.amount + fees)} XAF</span>
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Référence de transaction</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-afrilink-dark">{transaction.reference ?? transaction.id.slice(0, 12)}</span>
                  <button className="text-gray-400 hover:text-afrilink-dark transition-colors">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Moyen utilisé</span>
                <span className="text-xs font-medium text-afrilink-dark">Portefeuille AfriLinkPay</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Motif</span>
                <span className="text-xs font-medium text-afrilink-dark">{transaction.description ?? 'Envoi d\'argent'}</span>
              </div>
            </div>
          </div>

          {/* Historique */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
              Historique de la transaction
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-afrilink-green flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-afrilink-dark">Transaction initiée</p>
                  <p className="text-[11px] text-gray-400">{formatTime(transaction.createdAt)}</p>
                </div>
              </div>
              {transaction.status === 'completed' && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-afrilink-green flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-afrilink-dark">Paiement confirmé</p>
                    <p className="text-[11px] text-gray-400">{formatTime(transaction.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
        <button className="flex-1 h-11 rounded-xl border border-gray-200 text-xs font-semibold text-afrilink-dark flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
          <FileDown className="w-4 h-4" />
          Télécharger le reçu
        </button>
        <button className="flex-1 h-11 rounded-xl border border-gray-200 text-xs font-semibold text-afrilink-dark flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
          <Flag className="w-4 h-4" />
          Signaler un problème
        </button>
      </div>
    </div>
  );
}
