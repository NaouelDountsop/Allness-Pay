import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, IdCard, ScanFace, Home, Loader2 } from 'lucide-react';
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
  APPROVED: { tone: 'green', label: 'Validé' },
  PENDING: { tone: 'orange', label: 'En attente' },
  REJECTED: { tone: 'red', label: 'Rejeté' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fileUrl(path: string) {
  if (!path) return '';
  try {
    const url = new URL(path);
    return url.pathname;
  } catch {
    return path;
  }
}

export default function KycDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<AdminKycRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

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

  return (
    <AdminLayout active="kyc">
      <button
        onClick={() => navigate('/admin/kyc')}
        className="flex items-center gap-2 text-sm font-semibold text-afrilink-dark mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Détails de la validation KYC
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-afrilink-orange animate-spin" />
        </div>
      ) : error && !record ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : record ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 flex flex-col gap-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center">
              <Avatar
                initials={
                  record.userName && record.userNom
                    ? `${record.userName[0]}${record.userNom[0]}`
                    : `U${record.userId}`
                }
                size="lg"
              />
              <p className="text-sm font-bold text-afrilink-dark mt-3">
                {record.userName && record.userNom
                  ? `${record.userName} ${record.userNom}`
                  : `Utilisateur #${record.userId}`}
              </p>
              {record.userEmail && (
                <p className="text-[11px] text-gray-400 mb-1">{record.userEmail}</p>
              )}
              <p className="text-[11px] text-gray-400 mb-2">Dossier #{record.id}</p>
              <Badge tone={STATUS_BADGE[record.status]?.tone ?? 'orange'}>
                {STATUS_BADGE[record.status]?.label ?? record.status}
              </Badge>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5">
            <SectionCard title="Pièce d'Identité" icon={IdCard}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="aspect-[3/2] rounded-lg bg-gray-100 overflow-hidden">
                  <img
                    src={fileUrl(record.documentFrontUrl)}
                    alt="Document recto"
                    className="w-full h-full object-cover"
                  />
                </div>
                {record.documentBackUrl ? (
                  <div className="aspect-[3/2] rounded-lg bg-gray-100 overflow-hidden">
                    <img
                      src={fileUrl(record.documentBackUrl)}
                      alt="Document verso"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/2] rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-[11px]">
                    Pas de verso
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date de soumission" value={formatDate(record.createdAt)} />
                <Field
                  label="Type de document"
                  value={DOC_LABELS[record.IdentityDocumentType] || record.IdentityDocumentType}
                />
              </div>
            </SectionCard>

            <SectionCard title="Vérification Biométrique" icon={ScanFace}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 shrink-0 overflow-hidden">
                  <img
                    src={fileUrl(record.selfieUrl)}
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Selfie de vérification</p>
                  <p className="text-sm font-medium text-afrilink-dark">
                    Soumis le {formatDate(record.createdAt)}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Justificatif de Domicile" icon={Home}>
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
                <div className="aspect-[3/4] rounded-lg bg-gray-100 overflow-hidden">
                  <img
                    src={fileUrl(record.proofOfAddressUrl)}
                    alt="Justificatif de domicile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Field
                    label="Type de document"
                    value={
                      ADDRESS_DOC_LABELS[record.proofOfAddressType] || record.proofOfAddressType
                    }
                  />
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
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-afrilink-dark focus:outline-none focus:ring-1 focus:ring-afrilink-orange resize-none mb-4"
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
                    className="h-10 px-5 rounded-lg bg-afrilink-green text-white text-sm font-medium hover:opacity-90 transition-opacity flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
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
                  <p className="text-[11px] text-gray-400 mt-2">
                    Révisé le {formatDate(record.verifiedAt)}
                  </p>
                )}
              </SectionCard>
            )}
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
