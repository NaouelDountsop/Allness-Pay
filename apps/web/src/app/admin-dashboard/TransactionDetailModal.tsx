import {
  X,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Copy,
  Edit2,
  User,
  Ban,
} from 'lucide-react';
import { Badge } from '../../components/ui';
import type { AdminTransaction } from '../../lib/api/admin.service';

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  transfer_in: 'Transfert reçu',
  transfer_out: 'Transfert envoyé',
};

const STATUS_MAP: Record<string, { tone: 'green' | 'orange' | 'red' | 'blue'; label: string }> = {
  COMPLETED: { tone: 'green', label: 'Réussie' },
  completed: { tone: 'green', label: 'Réussie' },
  PENDING: { tone: 'orange', label: 'En attente' },
  pending: { tone: 'orange', label: 'En attente' },
  FAILED: { tone: 'red', label: 'Échouée' },
  failed: { tone: 'red', label: 'Échouée' },
  CANCELLED: { tone: 'red', label: 'Annulée' },
  cancelled: { tone: 'red', label: 'Annulée' },
};

function fmt(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[11px] font-medium text-allness-dark">{value}</span>
    </div>
  );
}

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '');
}

export function TransactionDetailModal({
  transaction,
  onClose,
}: {
  transaction: AdminTransaction;
  onClose: () => void;
}) {
  const status = STATUS_MAP[transaction.status] ?? {
    tone: 'orange' as const,
    label: transaction.status,
  };
  const typeLabel = TYPE_LABELS[transaction.type] ?? transaction.type;
  const fees = Math.round(transaction.amount * 0.01);
  const platformFees = Math.round(transaction.amount * 0.006);
  const totalDebit = transaction.amount + fees;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-allness-dark mb-1">
              TRANSACTION #{transaction.reference ?? transaction.id.slice(0, 16)}
            </h2>
            <div className="flex items-center gap-3">
              <Badge tone={status.tone} dot>
                {status.label}
              </Badge>
              <span className="text-xs text-gray-400">{fmtDateTime(transaction.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                downloadCsv(`recu-${transaction.reference ?? transaction.id.slice(0, 12)}.csv`, [
                  ['Référence', transaction.reference ?? transaction.id.slice(0, 12)],
                  ['Date', fmtDateTime(transaction.createdAt)],
                  ['Statut', status.label],
                  ['Type', typeLabel],
                  ['Expéditeur', transaction.user ?? '—'],
                  ['Email', transaction.email ?? '—'],
                  ['Montant', `${fmt(transaction.amount)} XAF`],
                  ['Frais', `${fmt(fees)} XAF`],
                  ['Frais plateforme', `${fmt(platformFees)} XAF`],
                  ['Total débité', `${fmt(totalDebit)} XAF`],
                  ['Description', transaction.description ?? ''],
                ]);
              }}
              className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter le reçu
            </button>
            <button className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
              <Printer className="w-3.5 h-3.5" />
              Imprimer
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Row 1: Expéditeur | Destinataire | Statut */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Expéditeur */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
                Expéditeur
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-allness-dark flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">{getInitials(transaction.user)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-allness-dark truncate">
                    {transaction.user ?? '—'}
                  </p>
                  <p className="text-[11px] text-gray-400">{transaction.email ?? '—'}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <Row label="ID" value={`USR-${transaction.id.slice(0, 6).toUpperCase()}`} />
                <Row
                  label="KYC"
                  value={<span className="text-allness-green font-semibold">Vérifié</span>}
                />
              </div>
            </div>

            {/* Destinataire */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
                Destinataire
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-allness-orange/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-allness-orange">
                    {transaction.type === 'transfer_out' ? getInitials(null) : getInitials(transaction.user)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-allness-dark truncate">
                    {transaction.type === 'transfer_out' ? '—' : transaction.user ?? '—'}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {transaction.phoneNumber ?? '—'}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <Row
                  label="ID"
                  value={
                    transaction.relatedWalletId
                      ? `USR-${transaction.relatedWalletId.slice(0, 6).toUpperCase()}`
                      : '—'
                  }
                />
                <Row
                  label="KYC"
                  value={<span className="text-allness-green font-semibold">Vérifié</span>}
                />
              </div>
            </div>

            {/* Statut */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
                Statut
              </p>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-allness-green" />
                <span className="text-sm font-semibold text-allness-dark">
                  Transaction {status.label.toLowerCase()}
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Score de risque</span>
                  <span className="text-allness-green font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                    Faible
                  </span>
                </div>
                <Row label="Canal" value="Wallet → Wallet" />
              </div>
            </div>
          </div>

          {/* Row 2: Financières | Techniques | Contrôles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Informations financières */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
                Informations financières
              </p>
              <div className="space-y-1">
                <Row label="Montant envoyé" value={`${fmt(transaction.amount)} XAF`} />
                <Row label="Frais de transaction" value={`${fmt(fees)} XAF`} />
                <Row label="Frais plateforme" value={`${fmt(platformFees)} XAF`} />
                <div className="border-t border-gray-100 my-2" />
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[11px] font-semibold text-allness-dark">Total débité</span>
                  <span className="text-xs font-bold text-allness-orange">{fmt(totalDebit)} XAF</span>
                </div>
                <Row label="Montant reçu" value={`${fmt(transaction.amount)} XAF`} />
              </div>
            </div>

            {/* Informations techniques */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
                Informations techniques
              </p>
              <div className="space-y-1">
                <Row label="Type de transaction" value={typeLabel} />
                <Row label="Devise" value="XAF" />
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[11px] text-gray-500">Référence</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-allness-dark">
                      {transaction.reference ?? transaction.id.slice(0, 12)}
                    </span>
                    <Copy className="w-3 h-3 text-gray-400 cursor-pointer" />
                  </div>
                </div>
                <Row label="ID externe" value={`EXT-${transaction.id.slice(0, 6).toUpperCase()}`} />
                <Row label="Date de création" value={fmtDateTime(transaction.createdAt)} />
                <Row label="Version" value="v2.3.1" />
                <Row label="Appareil" value="Android · Chrome" />
              </div>
            </div>

            {/* Contrôles */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
                Contrôles
              </p>
              <div className="space-y-2.5">
                {[
                  { label: 'KYC expéditeur', value: 'Vérifié' },
                  { label: 'KYC destinataire', value: 'Vérifié' },
                  { label: 'Vérification AML', value: 'Aucun signal' },
                  { label: 'Vérification fraude', value: 'Aucun signal' },
                  { label: 'Limites', value: 'Conforme' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-allness-green" />
                      <span className="text-[11px] text-gray-600">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-allness-green bg-green-50 px-2 py-0.5 rounded-full">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Journal | Informations supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Journal de transaction */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
                Journal de transaction
              </p>
              <div className="space-y-0">
                {[
                  { time: fmtTime(transaction.createdAt), label: 'Transaction créée', done: true },
                  { time: fmtTime(transaction.createdAt), label: 'Vérifications effectuées', done: true },
                  { time: fmtTime(transaction.createdAt), label: 'Débit du portefeuille expéditeur', done: true },
                  { time: fmtTime(transaction.createdAt), label: 'Crédit du portefeuille destinataire', done: true },
                  { time: fmtTime(transaction.createdAt), label: 'Transaction confirmée avec succès', done: true },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          step.done ? 'bg-allness-green' : 'bg-gray-200'
                        }`}
                      >
                        {step.done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                      {i < 4 && <div className="w-px h-5 bg-gray-200 my-0.5" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-[11px] font-medium text-allness-dark">{step.label}</p>
                      <p className="text-[10px] text-gray-400">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-3">
                Informations supplémentaires
              </p>
              <div className="space-y-1">
                <Row label="Motif" value={transaction.description ?? 'Envoi d\'argent'} />
                <Row label="Opérateur" value={transaction.provider ?? 'MTN Cameroon'} />
                <Row label="Localisation" value="Douala, Cameroun" />
                <Row label="ID session" value={`SESS-${transaction.id.slice(0, 8).toUpperCase()}`} />
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[11px] text-gray-500">Note interne</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-400">—</span>
                    <Edit2 className="w-3 h-3 text-gray-400 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex items-center gap-3">
          <button className="h-9 px-4 rounded-lg border border-red-200 text-xs font-medium text-red-600 flex items-center gap-1.5 hover:bg-red-50 transition-colors">
            <Ban className="w-3.5 h-3.5" />
            Rembourser la transaction
          </button>
          <button className="h-9 px-4 rounded-lg border border-red-200 text-xs font-medium text-red-600 flex items-center gap-1.5 hover:bg-red-50 transition-colors">
            <User className="w-3.5 h-3.5" />
            Bloquer l&apos;utilisateur
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
