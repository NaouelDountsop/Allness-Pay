import {
  X,
  Download,
  CheckCircle2,
  Clock,
  Copy,
  ArrowLeftRight,
  Ban,
  FileText,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter } from '../../components/ui/dialog';
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

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '');
}

/* ---------- Sous-composants réutilisés du Design System ---------- */

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ArrowLeftRight;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-allness-green" />
        <p className="text-sm font-semibold text-allness-dark">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-allness-dark whitespace-pre-line">{value}</p>
        {badge && (
          <span className="text-[10px] font-medium text-allness-green bg-green-50 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function FieldWithCopy({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium text-allness-dark">{value}</p>
        <Copy className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
    </div>
  );
}

/* ---------- Composant principal ---------- */

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
  const fees = Math.round(transaction.amount * 0.00);
  const platformFees = Math.round(transaction.amount * 0.006);
  const totalDebit = transaction.amount + fees;

  const senderName = transaction.user ?? '—';
  const recipientName = transaction.beneficiaryName ?? (transaction.type === 'transfer_out' ? '—' : transaction.user ?? '—');

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent hideHeader className="sm:max-w-5xl w-full max-h-[95vh] p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex items-start gap-5 px-6 py-5 border-b border-gray-100">
          <div className="w-14 h-14 shrink-0 rounded-full bg-allness-green/10 flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6 text-allness-green" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-allness-dark">
                TRANSACTION {transaction.reference ?? transaction.id.slice(0, 16)}
              </h2>
              <Badge tone={status.tone} dot>
                {status.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {fmtDateTime(transaction.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> {typeLabel}
              </span>
              <span className="flex items-center gap-1">
                Ref: {transaction.reference ?? transaction.id.slice(0, 12)}
                <Copy className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
              </span>
            </div>
          </div>

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
            className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5 overflow-y-auto max-h-[calc(95vh-180px)]">
          {/* Colonne gauche (2/3) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Expéditeur & Destinataire */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card icon={Smartphone} title="Expéditeur">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-allness-dark flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">{getInitials(senderName)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-allness-dark truncate">{senderName}</p>
                    <p className="text-[11px] text-gray-400">{transaction.email ?? '—'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Field label="ID Utilisateur" value={`USR-${transaction.id.slice(0, 6).toUpperCase()}`} />
                </div>
              </Card>

              <Card icon={CreditCard} title="Destinataire">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-allness-orange/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-allness-orange">
                      {getInitials(recipientName)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-allness-dark truncate">{recipientName}</p>
                    <p className="text-[11px] text-gray-400">{transaction.phoneNumber ?? '—'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Field
                    label="ID"
                    value={
                      transaction.relatedWalletId
                        ? `USR-${transaction.relatedWalletId.slice(0, 6).toUpperCase()}`
                        : '—'
                    }
                  />
                </div>
              </Card>
            </div>

            {/* Informations financières */}
            <Card icon={ArrowLeftRight} title="Informations financières">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Montant envoyé" value={`${fmt(transaction.amount)} XAF`} />
                <Field label="Montant reçu" value={`${fmt(transaction.amount)} XAF`} />
                <Field label="Frais de transaction" value={`${fmt(fees)} XAF`} />
                <Field label="Frais plateforme" value={`${fmt(platformFees)} XAF`} />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-allness-dark">Total débité</span>
                <span className="text-sm font-bold text-allness-orange">{fmt(totalDebit)} XAF</span>
              </div>
            </Card>

            {/* Journal de transaction */}
            <Card icon={Clock} title="Journal de transaction">
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
            </Card>
          </div>

          {/* Colonne droite (1/3) */}
          <div className="space-y-5">
            {/* Statut */}
            <Card icon={CheckCircle2} title="Statut">
              <div className="flex items-center gap-2 mb-3">
                <Badge tone={status.tone} dot>
                  {status.label}
                </Badge>
              </div>
              <div className="space-y-2">
                <Field label="Devise" value="XAF" />
              </div>
            </Card>

            {/* Informations techniques */}
            <Card icon={FileText} title="Informations techniques">
              <div className="space-y-2">
                <Field label="Type" value={typeLabel} />
                <FieldWithCopy label="Référence" value={transaction.reference ?? transaction.id.slice(0, 12)} />
                <Field label="ID externe" value={`EXT-${transaction.id.slice(0, 6).toUpperCase()}`} />
                <Field label="Date de création" value={fmtDateTime(transaction.createdAt)} />
              </div>
            </Card>

            {/* Informations supplémentaires */}
            <Card icon={FileText} title="Informations supplémentaires">
              <div className="space-y-2">
                <Field label="Motif" value={transaction.description ?? "Envoi d'argent"} />
                <Field label="Opérateur" value={transaction.provider ?? '/'} />
              </div>
            </Card>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter>
          <button className="h-9 px-4 rounded-lg border border-red-200 text-xs font-medium text-red-600 flex items-center gap-1.5 hover:bg-red-50 transition-colors">
            <Ban className="w-3.5 h-3.5" />
            Rembourser la transaction
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
