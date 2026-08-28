import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  UserPlus,
  Users,
  ShieldCheck,
  Send,
  Star,
  Search,
  ChevronDown,
  RotateCcw,
  MoreVertical,
  Link2,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';

import { DashboardLayout } from '../../components/user_dashboard/dash-layout';
import { DashboardHeader } from '../../components/user_dashboard/header';
//import { Badge } from '../../components/ui/badge';
import { Pagination } from '../../components/ui/pagination';
import { AddBeneficiaryModal } from '../../components/user_dashboard/beneficiary/add-beneficiary-modal';
import { beneficiaryService, type Beneficiary } from '../../lib/api/beneficiary.service';
import { getFlagUrl } from '../../data/countries';

const COUNTRY_MAP: Record<string, string> = {
  CM: 'Cameroun',
  SN: 'Sénégal',
  CI: "Côte d'Ivoire",
  GA: 'Gabon',
  CG: 'Congo',
  CD: 'Rép. Dém. du Congo',
  NE: 'Niger',
  ML: 'Mali',
  BF: 'Burkina Faso',
  TG: 'Togo',
  BJ: 'Bénin',
  GN: 'Guinée',
  RW: 'Rwanda',
  KE: 'Kenya',
  GH: 'Ghana',
  NG: 'Nigeria',
  ZA: 'Afrique du Sud',
  FR: 'France',
  CA: 'Canada',
  US: 'États-Unis',
};

function BeneficiaryActionsMenu({
  beneficiary,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  beneficiary: Beneficiary;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.right - 160 });
    }
    setOpen(!open);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-allness-dark"
        aria-label={t('beneficiaries.moreOptions')}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div
          ref={menuRef}
          className="fixed w-40 rounded-lg border border-gray-100 bg-white shadow-lg overflow-hidden z-[9999]"
          style={{ top: position.top, left: position.left }}
        >
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            {t('beneficiaries.edit')}
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('beneficiaries.delete')}
          </button>
          <button
            onClick={() => {
              onToggleFavorite();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Star className={`w-3.5 h-3.5 ${beneficiary.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
            {beneficiary.isFavorite ? t('beneficiaries.removeFavorite') : t('beneficiaries.addFavorite')}
          </button>
        </div>
      )}
    </>
  );
}

const NETWORK_LABELS: Record<string, string> = {
  MTN_MOMO: 'MTN Mobile Money',
  ORANGE_MONEY: 'Orange Money',
  WAVE: 'Wave',
  MOOV_MONEY: 'Moov Money',
  AFRILINKPAY: 'AllnessPay',
  AUTRE: 'Autre',
};

function NetworkBadge({ network }: { network: string }) {
  const isMtn = network === 'MTN_MOMO';
  const isOrange = network === 'ORANGE_MONEY';
  const label = NETWORK_LABELS[network] ?? network;
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold shrink-0 ${
          isMtn ? 'bg-yellow-400 text-allness-dark' : isOrange ? 'bg-orange-500 text-white' : 'bg-gray-400 text-white'
        }`}
      >
        {isMtn ? 'MTN' : isOrange ? 'OM' : label.slice(0, 2).toUpperCase()}
      </span>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

export default function BeneficiariesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const PAGE_SIZE = 5;

  const { data: response, isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: beneficiaryService.list,
  });

  const beneficiaries = response?.data ?? [];
  const filtered = beneficiaries.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSend = (b: Beneficiary) => {
    const params = new URLSearchParams({
      name: b.name,
      walletNumber: b.phone,
    });
    navigate(`/dashboard/send?${params.toString()}`);
  };

  const stats = {
    total: beneficiaries.length,
    verified: beneficiaries.filter((b) => b.status === 'verified').length,
    favorites: beneficiaries.filter((b) => b.isFavorite).length,
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-allness-orange animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-allness-dark mb-1">
              {t('beneficiaries.pageTitle')}
            </h1>
            <p className="text-sm text-gray-400">
              {t('beneficiaries.pageDescription')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAddModalOpen(true)}
              className="group relative h-10 rounded-lg bg-allness-green text-white text-sm font-medium flex items-center justify-center sm:px-4 px-0 w-10 sm:w-auto hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">{t('beneficiaries.addBeneficiary')}</span>
              <span className="sm:hidden absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#082B37] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {t('beneficiaries.add')}
              </span>
            </button>
            <button className="group relative h-10 rounded-lg border border-allness-green bg-white text-gray-600 text-sm font-medium flex items-center justify-center sm:px-4 px-0 w-10 sm:w-auto hover:bg-gray-50 transition-colors">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">{t('beneficiaries.importFromContacts')}</span>
              <span className="sm:hidden absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[#082B37] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {t('beneficiaries.import')}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </span>
              <span className="text-sm text-gray-300">{t('beneficiaries.totalBeneficiaries')}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{stats.total}</p>
          </div>

          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-400" />
              </span>
              <span className="text-sm text-gray-300">{t('beneficiaries.verifiedBeneficiaries')}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{stats.verified}</p>
            <p className="text-xs text-orange-400">
              {t('beneficiaries.percentOfTotal', { percent: stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0 })}
            </p>
          </div>

          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-green-400" />
              </span>
              <span className="text-sm text-gray-300">{t('beneficiaries.transfersThisMonth')}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">—</p>
          </div>

          <div className="bg-allness-dark rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </span>
              <span className="text-sm text-gray-300">{t('beneficiaries.favoriteBeneficiaries')}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{stats.favorites}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 items-end">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">
                {t('beneficiaries.search')}
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('beneficiaries.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-allness-orange"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('beneficiaries.status')}</label>
              <button className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                {t('beneficiaries.all')}
                <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
              </button>
            </div>
            {/* <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Réseau</label>
              <select
                value={networkFilter}
                onChange={(e) => setNetworkFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-allness-orange"
              >
                <option value="all">Tous</option>
                <option value="MTN_MOMO">MTN Mobile Money</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="WAVE">Wave</option>
                <option value="FREE_MONEY">Free Money</option>
                <option value="MOOV_MONEY">Moov Money</option>
                <option value="AIRTEL_MONEY">Airtel Money</option>
              </select>
            </div>
              <button className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                Tous
                <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
              </button>
            </div> */}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5">{t('beneficiaries.country')}</label>
              <button className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                {t('beneficiaries.all')}
                <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mb-5">
            <button className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('beneficiaries.reset')}</span>
            </button>
            <button className="h-9 px-5 rounded-lg bg-allness-green text-white text-xs font-medium hover:opacity-90 transition-opacity">
              {t('beneficiaries.filter')}
            </button>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm min-w-[580px]">
              <thead>
                <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                  <th className="font-medium pb-3">{t('beneficiaries.beneficiary')}</th>
                  <th className="font-medium pb-3 hidden sm:table-cell">{t('beneficiaries.walletNumber')}</th>
                  <th className="font-medium pb-3 hidden md:table-cell">{t('beneficiaries.network')}</th>
                  <th className="font-medium pb-3 hidden lg:table-cell">{t('beneficiaries.country')}</th>
                  {/* <th className="font-medium pb-3">Statut</th> */}
                  <th className="font-medium pb-3 hidden xl:table-cell">{t('beneficiaries.addedOn')}</th>
                  <th className="font-medium pb-3 text-right">{t('beneficiaries.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((b) => {
                  const countryKey = Object.entries(COUNTRY_MAP).find(
                    ([, name]) => name === b.country,
                  )?.[0];
                  const initials = b.name
                    .split(' ')
                    .filter((w) => w.length > 0)
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <tr key={b.id} className="border-b border-gray-50 last:border-0">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-allness-orange/10 text-allness-orange flex items-center justify-center text-[11px] font-semibold shrink-0">
                            {initials}
                          </span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-xs font-medium text-allness-dark truncate">{b.name}</p>
                            {b.isFavorite && (
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-gray-600 hidden sm:table-cell">{b.phone}</td>
                      <td className="hidden md:table-cell">
                        <NetworkBadge network={b.network} />
                      </td>
                      <td className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          {countryKey && (
                            <img
                              src={getFlagUrl(countryKey)}
                              alt={b.country}
                              className="w-4 h-3 rounded-sm object-cover"
                            />
                          )}
                          {b.country}
                        </div>
                      </td>
                      {/* <td>
                        <Badge
                          tone={
                            b.status === 'verified'
                              ? 'green'
                              : b.status === 'pending'
                                ? 'orange'
                                : 'red'
                          }
                          dot
                        >
                          {b.status === 'verified'
                            ? 'Vérifié'
                            : b.status === 'pending'
                              ? 'En attente'
                              : 'Rejeté'}
                        </Badge>
                      </td> */}
                      <td className="text-xs text-gray-500 hidden xl:table-cell">
                        {new Date(b.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSend(b)}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-allness-green hover:bg-allness-green/10 transition-colors"
                            aria-label={t('beneficiaries.sendMoney')}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <BeneficiaryActionsMenu
                            beneficiary={b}
                            onEdit={() => { /* TODO: open edit modal */ }}
                            onDelete={() => { /* TODO: open delete confirm */ }}
                            onToggleFavorite={() => { /* TODO: toggle favorite */ }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                      {t('beneficiaries.noResult')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-gray-400">
              {t('beneficiaries.showingCount', { count: filtered.length })}
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-allness-green" />
            </span>
            <div>
              <p className="text-xs font-semibold text-allness-dark mb-1">{t('beneficiaries.securedTransfers')}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {t('beneficiaries.securedTransfersDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-allness-green" />
            </span>
            <div>
              <p className="text-xs font-semibold text-allness-dark mb-1">
                {t('beneficiaries.beneficiaryVerification')}
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {t('beneficiaries.beneficiaryVerificationDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4 text-allness-green" />
            </span>
            <div>
              <p className="text-xs font-semibold text-allness-dark mb-1">{t('beneficiaries.simplifiedManagement')}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {t('beneficiaries.simplifiedManagementDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AddBeneficiaryModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </DashboardLayout>
  );
}
