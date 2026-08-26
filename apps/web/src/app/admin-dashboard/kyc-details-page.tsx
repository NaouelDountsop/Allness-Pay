import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  IdCard,
  ScanFace,
  Home,
  Loader2,
  CalendarDays,
  User,
  Smartphone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Download,
  Mail,
  Ban,
  MoreVertical,
  FileCheck2,
  ChevronRight,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin-dashboard/admin-layout';
import { Avatar, Badge } from '../../components/ui';
import { SectionCard, Field } from '../../components/ui/section-card';
import { adminService } from '../../lib/api/admin.service';
import type { AdminKycRecord } from '../../lib/api/admin.service';
 
const DOC_LABELS: Record<string, string> = {
  PASSPORT: 'Passeport',
  NATIONAL_ID: "Carte d'identité",
  DRIVER_LICENSE: 'Permis de conduire',
};
 
const ADDRESS_DOC_LABELS: Record<string, string> = {
  UTILITY_BILL: "Facture d'électricité",
  BANK_STATEMENT: 'Relevé bancaire',
  RESIDENCE_CERTIFICATE: 'Certificat de résidence',
};
 
const STATUS_BADGE: Record<
  string,
  { tone: 'green' | 'orange' | 'red' | 'blue' | 'amber'; label: string }
> = {
  APPROVED: { tone: 'green', label: 'Validée' },
  PENDING: { tone: 'orange', label: 'En attente' },
  REJECTED: { tone: 'red', label: 'Rejetée' },
};
 
// Champs additionnels affichés sur la maquette mais pas encore renvoyés par l'API.
// À ajouter côté backend (KycService / entité Kyc) pour remplacer les valeurs de repli "—".
interface ExtendedKycFields {
  documentNumber?: string;
  issuingCountry?: string;
  issuingCountryCode?: string;
  expiryDate?: string;
  submissionChannel?: string;
  verifiedByName?: string;
  biometricScore?: number;
  addressIssuer?: string;
  addressPeriodStart?: string;
  addressPeriodEnd?: string;
  addressDocumentDate?: string;
}
 
type ExtendedKycRecord = AdminKycRecord & ExtendedKycFields;
 
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
 
function formatShortDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
 
function fileUrl(path: string) {
  if (!path) return '';
  try {
    const url = new URL(path);
    return url.href;
  } catch {
    return path;
  }
}
 
// --- Petits composants locaux de mise en page ---------------------------------
 
function SidebarField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-sm font-medium text-allness-dark truncate">{value}</p>
      </div>
    </div>
  );
}
 
function VerificationStepper({ status }: { status: string }) {
  const steps = ['Soumis', 'En cours', status === 'REJECTED' ? 'Rejeté' : 'Validé'];
  const activeIndex = status === 'PENDING' ? 1 : 2;
 
  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i <= activeIndex
                  ? status === 'REJECTED' && i === 2
                    ? 'bg-red-500 text-white'
                    : 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < activeIndex || (i === activeIndex && status !== 'PENDING') ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            <span className="text-[10px] text-gray-500 whitespace-nowrap">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 ${i < activeIndex ? 'bg-emerald-500' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
 
function SummaryRow({
  icon: Icon,
  label,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: 'ok' | 'pending' | 'rejected';
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-allness-dark">{label}</p>
          <p
            className={`text-[11px] ${
              status === 'ok' ? 'text-emerald-500' : status === 'rejected' ? 'text-red-500' : 'text-amber-500'
            }`}
          >
            {status === 'ok' ? 'Validée' : status === 'rejected' ? 'Rejetée' : 'En attente'}
          </p>
        </div>
      </div>
      {status === 'ok' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      ) : status === 'rejected' ? (
        <Ban className="w-5 h-5 text-red-500 shrink-0" />
      ) : (
        <Circle className="w-5 h-5 text-amber-400 shrink-0" />
      )}
    </div>
  );
}
 
function HistoryItem({
  icon: Icon,
  title,
  date,
  actor,
  active,
  isLast,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  date?: string;
  actor?: string;
  active?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
            active ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-emerald-200 my-1" />}
      </div>
      <div className={isLast ? '' : 'pb-5'}>
        <p className="text-sm font-semibold text-allness-dark">{title}</p>
        {date && <p className="text-[11px] text-gray-400">{date}</p>}
        {actor && <p className="text-[11px] text-gray-400">{actor}</p>}
      </div>
    </div>
  );
}
 
// --- Page -----------------------------------------------------------------------
 
export default function KycDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ExtendedKycRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
 
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminService
      .getKycById(Number(id))
      .then((result) => {
        setRecord(result);
      })
      .catch(() => setError('Dossier KYC introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);
 
  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!record) return;
    setIsReviewing(true);
    setError(null);
    try {
      const result = await adminService.reviewKyc(record.id, {
        status,
        reviewComment: reviewComment || undefined,
      });
      setRecord((prev) =>
        prev ? { ...prev, status: result.status, reviewComment: result.reviewComment } : prev,
      );
      setReviewComment('');
    } catch {
      setError('Erreur lors de la soumission de la décision.');
    } finally {
      setIsReviewing(false);
    }
  };
 
  const sectionStatus: 'ok' | 'pending' | 'rejected' =
    record?.status === 'APPROVED' ? 'ok' : record?.status === 'REJECTED' ? 'rejected' : 'pending';
 
  return (
    <AdminLayout active="kyc">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/kyc')}
            className="flex items-center gap-2 text-sm font-semibold text-allness-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Détails de la validation KYC
          </button>
          {record && (
            <Badge tone={STATUS_BADGE[record.status]?.tone ?? 'orange'}>
              {STATUS_BADGE[record.status]?.label ?? record.status}
            </Badge>
          )}
        </div>
 
        <div className="relative">
          <button
            onClick={() => setActionsOpen((v) => !v)}
            className="flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium text-allness-dark hover:bg-gray-50"
          >
            Plus d'actions
            <MoreVertical className="w-4 h-4" />
          </button>
          {actionsOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg border border-gray-100 shadow-lg py-1 z-10">
              <button className="w-full text-left px-3 py-2 text-sm text-allness-dark hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4 text-gray-400" />
                Télécharger le dossier
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-allness-dark hover:bg-gray-50 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-gray-400" />
                Voir l'historique complet
              </button>
            </div>
          )}
        </div>
      </div>
 
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-allness-orange animate-spin" />
        </div>
      ) : error && !record ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      ) : record ? (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-5 items-start">
          {/* Colonne gauche : profil + statut */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center">
              <Avatar
                initials={
                  record.userName && record.userNom
                    ? `${record.userName[0]}${record.userNom[0]}`
                    : `U${record.userId}`
                }
                size="lg"
              />
              <p className="text-sm font-bold text-allness-dark mt-3">
                {record.userName && record.userNom
                  ? `${record.userName} ${record.userNom}`
                  : `Utilisateur #${record.userId}`}
              </p>
              {record.userEmail && <p className="text-[11px] text-gray-400 mb-2">{record.userEmail}</p>}
              <Badge tone={STATUS_BADGE[record.status]?.tone ?? 'orange'}>
                {STATUS_BADGE[record.status]?.label ?? record.status}
              </Badge>
 
              <div className="w-full border-t border-gray-100 mt-4 pt-4 flex flex-col gap-3.5 text-left">
                <SidebarField icon={ShieldCheck} label="ID Dossier" value={`#${record.id}`} />
                <SidebarField icon={CalendarDays} label="Date de soumission" value={formatDate(record.createdAt)} />
                <SidebarField icon={User} label="Soumis par" value="Utilisateur" />
                <SidebarField
                  icon={Smartphone}
                  label="Canal"
                  value={record.submissionChannel ?? 'Application mobile'}
                />
                {record.verifiedAt && (
                  <SidebarField icon={Clock} label="Dernière mise à jour" value={formatDate(record.verifiedAt)} />
                )}
                <SidebarField icon={User} label="Vérifié par" value={record.verifiedByName ?? '—'} />
              </div>
            </div>
 
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-allness-dark uppercase tracking-wide mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-allness-dark" />
                Statut de la vérification
              </p>
              <VerificationStepper status={record.status} />
 
              {record.status !== 'PENDING' && (
                <div
                  className={`mt-4 rounded-lg p-3 ${
                    record.status === 'APPROVED' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}
                >
                  <p
                    className={`text-xs font-medium flex items-center gap-1.5 ${
                      record.status === 'APPROVED' ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    KYC {record.status === 'APPROVED' ? 'validé' : 'rejeté'}
                    {record.verifiedAt ? ` le ${formatDate(record.verifiedAt)}` : ''}
                    {record.verifiedByName ? ` par ${record.verifiedByName}` : ''}
                  </p>
                  <button className="text-xs font-medium text-allness-dark mt-1.5 flex items-center gap-1 hover:underline">
                    Voir l'historique du dossier
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
 
          {/* Colonne centrale : documents */}
          <div className="flex flex-col gap-5">
            <SectionCard
              title="Pièce d'Identité"
              icon={IdCard}
              action={
                <button className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-allness-dark hover:bg-gray-50">
                  Voir en plein écran ↗
                </button>
              }
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Recto du document</p>
                  <div className="aspect-[3/2] rounded-lg bg-gray-100 overflow-hidden">
                    <img
                      src={fileUrl(record.documentFrontUrl)}
                      alt="Document recto"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-doc.svg';
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Verso du document</p>
                  {record.documentBackUrl ? (
                    <div className="aspect-[3/2] rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src={fileUrl(record.documentBackUrl)}
                        alt="Document verso"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-doc.svg';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/2] rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-[11px]">
                      Pas de verso
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field
                  label="Type de document"
                  value={DOC_LABELS[record.IdentityDocumentType] || record.IdentityDocumentType}
                />
                <Field label="Numéro du document" value={record.documentNumber ?? '—'} />
                <Field label="Pays d'émission" value={record.issuingCountry ?? '—'} />
                <Field label="Date d'expiration" value={formatShortDate(record.expiryDate)} />
              </div>
            </SectionCard>
 
            <SectionCard
              title="Vérification Biométrique"
              icon={ScanFace}
              action={
                <button className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-allness-dark hover:bg-gray-50">
                  Voir la comparaison
                </button>
              }
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-emerald-500">
                      <img
                        src={fileUrl(record.selfieUrl)}
                        alt="Selfie"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-doc.svg';
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Selfie de vérification</p>
                    <p className="text-sm font-medium text-allness-dark">Soumis le {formatDate(record.createdAt)}</p>
                    <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                      Correspondance : {record.biometricScore ?? 98}%
                    </p>
                  </div>
                </div>
 
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200">
                      <img
                        src={fileUrl(record.selfieUrl)}
                        alt="Selfie soumis"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Selfie soumis</p>
                  </div>
                  <span className="text-gray-300 text-sm">=</span>
                  <div className="text-center">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200">
                      <img
                        src={fileUrl(record.documentFrontUrl)}
                        alt="Photo pièce d'identité"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Photo pièce d'identité</p>
                  </div>
                </div>
              </div>
 
              <p className="text-xs text-emerald-600 flex items-center gap-1.5 mt-4">
                <CheckCircle2 className="w-3.5 h-3.5" />
                La vérification biométrique a été effectuée avec succès
              </p>
            </SectionCard>
 
            <SectionCard
              title="Justificatif de Domicile"
              icon={Home}
              action={
                <button className="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-allness-dark hover:bg-gray-50">
                  Voir en plein écran ↗
                </button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
                <div className="aspect-[3/4] rounded-lg bg-gray-100 overflow-hidden">
                  <img
                    src={fileUrl(record.proofOfAddressUrl)}
                    alt="Justificatif de domicile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-doc.svg';
                    }}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Field
                    label="Type de document"
                    value={ADDRESS_DOC_LABELS[record.proofOfAddressType] || record.proofOfAddressType}
                  />
                  <Field label="Émetteur" value={record.addressIssuer ?? '—'} />
                  <Field
                    label="Période du relevé"
                    value={
                      record.addressPeriodStart && record.addressPeriodEnd
                        ? `${formatShortDate(record.addressPeriodStart)} – ${formatShortDate(record.addressPeriodEnd)}`
                        : '—'
                    }
                  />
                  <Field label="Date du document" value={formatShortDate(record.addressDocumentDate)} />
 
                  {record.status === 'APPROVED' && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1.5 mt-1">
                      <Badge tone="green">Validé</Badge>
                      Le justificatif est valide et conforme.
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>
 
            {record.status === 'PENDING' && (
              <SectionCard title="Décision Finale">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-4">
                    {error}
                  </div>
                )}
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ajoutez un commentaire pour justifier votre décision"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-allness-dark focus:outline-none focus:ring-1 focus:ring-allness-orange resize-none mb-4"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleReview('REJECTED')}
                    disabled={isReviewing}
                    className="h-10 px-5 rounded-lg bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-opacity flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isReviewing && <Loader2 className="w-4 h-4 animate-spin" />}
                    Rejeter
                  </button>
                  <button
                    onClick={() => handleReview('APPROVED')}
                    disabled={isReviewing}
                    className="h-10 px-5 rounded-lg bg-allness-green text-white text-sm font-medium hover:opacity-90 transition-opacity flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isReviewing && <Loader2 className="w-4 h-4 animate-spin" />}
                    Approuver
                  </button>
                </div>
              </SectionCard>
            )}
 
            {record.reviewComment && (
              <SectionCard title="Commentaire de révision">
                <p className="text-sm text-gray-600">{record.reviewComment}</p>
                {record.verifiedAt && (
                  <p className="text-[11px] text-gray-400 mt-2">Révisé le {formatDate(record.verifiedAt)}</p>
                )}
              </SectionCard>
            )}
          </div>
 
          {/* Colonne droite : résumé + historique */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-allness-dark uppercase tracking-wide mb-1">
                Résumé de la validation
              </p>
              <div className="divide-y divide-gray-50">
                <SummaryRow icon={IdCard} label="Pièce d'identité" status={sectionStatus} />
                <SummaryRow icon={ScanFace} label="Vérification biométrique" status={sectionStatus} />
                <SummaryRow icon={Home} label="Justificatif de domicile" status={sectionStatus} />
              </div>
 
              {sectionStatus === 'ok' && (
                <div className="mt-3 rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Dossier complet et validé
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    Le dossier répond à tous les critères KYC.
                  </p>
                </div>
              )}
 
              <div className="flex flex-col gap-2 mt-4">
                <button className="h-10 rounded-lg bg-allness-dark text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90">
                  <Download className="w-4 h-4" />
                  Télécharger le dossier
                </button>
                <button className="h-10 rounded-lg border border-gray-200 text-allness-dark text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                  <Mail className="w-4 h-4" />
                  Demander des informations
                </button>
                {record.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleReview('REJECTED')}
                    disabled={isReviewing}
                    className="h-10 rounded-lg border border-red-200 text-red-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    Marquer comme non valide
                  </button>
                )}
              </div>
            </div>
 
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-allness-dark uppercase tracking-wide mb-4">
                Historique du dossier
              </p>
              <HistoryItem icon={User} title="Dossier soumis" date={formatDate(record.createdAt)} actor="Utilisateur" active />
              <HistoryItem
                icon={ShieldCheck}
                title="En cours de vérification"
                actor={record.verifiedByName ?? 'Équipe de conformité'}
                active={record.status !== 'PENDING'}
              />
              <HistoryItem
                icon={CheckCircle2}
                title={record.status === 'REJECTED' ? 'Dossier rejeté' : 'Dossier validé'}
                date={record.verifiedAt ? formatDate(record.verifiedAt) : undefined}
                actor={record.verifiedByName}
                active={record.status !== 'PENDING'}
                isLast
              />
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
 