import { useState } from "react";
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
  ShieldCheck as SecureIcon,
  Link2,
} from "lucide-react";

import { DashboardLayout } from "../../components/user_dashboard/dash-layout";
import { DashboardHeader } from "../../components/user_dashboard/header";
import { Badge } from "../../components/ui/badge";
import { Pagination } from "../../components/ui/pagination";

interface Beneficiary {
  initials: string;
  avatarBg: string;
  name: string;
  favorite: boolean;
  phone: string;
  network: "MTN Mobile Money" | "Orange Money";
  country: string;
  nickname: string;
  status: "Vérifié" | "En attente";
  addedOn: string;
}

const BENEFICIARIES: Beneficiary[] = [
  {
    initials: "AB",
    avatarBg: "bg-green-100 text-green-700",
    name: "Alain Belibi",
    favorite: true,
    phone: "+237 6 70 11 22 33",
    network: "MTN Mobile Money",
    country: "Cameroun",
    nickname: "Frère",
    status: "Vérifié",
    addedOn: "12 mai 2024",
  },
  {
    initials: "FS",
    avatarBg: "bg-blue-100 text-blue-700",
    name: "Françoise Simo",
    favorite: true,
    phone: "+237 6 71 44 55 66",
    network: "Orange Money",
    country: "Cameroun",
    nickname: "Maman",
    status: "Vérifié",
    addedOn: "08 mai 2024",
  },
  {
    initials: "JN",
    avatarBg: "bg-purple-100 text-purple-700",
    name: "Jean Nkodo",
    favorite: false,
    phone: "+237 6 72 77 88 99",
    network: "MTN Mobile Money",
    country: "Cameroun",
    nickname: "Collègue",
    status: "En attente",
    addedOn: "05 mai 2024",
  },
  {
    initials: "CD",
    avatarBg: "bg-cyan-100 text-cyan-700",
    name: "Cédric Djoumessi",
    favorite: false,
    phone: "+237 6 73 10 20 30",
    network: "Orange Money",
    country: "Cameroun",
    nickname: "Ami d'enfance",
    status: "Vérifié",
    addedOn: "01 mai 2024",
  },
  {
    initials: "ML",
    avatarBg: "bg-pink-100 text-pink-700",
    name: "Marie Lontchi",
    favorite: false,
    phone: "+237 6 74 33 44 55",
    network: "MTN Mobile Money",
    country: "Cameroun",
    nickname: "Sœur",
    status: "Vérifié",
    addedOn: "28 avr. 2024",
  },
];

function NetworkBadge({ network }: { network: Beneficiary["network"] }) {
  const isMtn = network === "MTN Mobile Money";
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold shrink-0 ${
          isMtn ? "bg-yellow-400 text-afrilink-dark" : "bg-orange text-white"
        }`}
      >
        {isMtn ? "MTN" : "OM"}
      </span>
      <span className="text-xs text-gray-600">{network}</span>
    </div>
  );
}

export default function BeneficiariesPage() {
  const [page, setPage] = useState(1);

  return (
    <DashboardLayout>
      <DashboardHeader />

      <div>
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-afrilink-dark mb-1">Gestion des Bénéficiaires</h1>
              <p className="text-sm text-gray-400">
                Ajoutez, gérez et transférez de l'argent à vos bénéficiaires en toute simplicité.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="h-10 px-4 rounded-lg bg-afrilink-orange text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Ajouter un bénéficiaire
              </button>
              <button className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
                <UserPlus className="w-3.5 h-3.5" />
                Importer depuis les contacts
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] font-semibold text-gray-400 tracking-wide">TOTAL BÉNÉFICIAIRES</p>
                <Users className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-afrilink-dark mb-1">24</p>
              <p className="text-[11px] text-afrilink-green font-medium">+12% ce mois</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] font-semibold text-gray-400 tracking-wide">BÉNÉFICIAIRES VÉRIFIÉS</p>
                <ShieldCheck className="w-4.5 h-4.5 text-afrilink-green" />
              </div>
              <p className="text-2xl font-bold text-afrilink-dark mb-1">20</p>
              <p className="text-[11px] text-afrilink-green font-medium">83% du total</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] font-semibold text-gray-400 tracking-wide">TRANSFERTS CE MOIS</p>
                <Send className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-afrilink-dark mb-1">42</p>
              <p className="text-[11px] text-gray-400">1 245 000 FCFA</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] font-semibold text-gray-400 tracking-wide">BÉNÉFICIAIRES FAVORIS</p>
                <Star className="w-4.5 h-4.5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-afrilink-dark">8</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3 items-end">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Rechercher</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nom, numéro..."
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-afrilink-orange"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Statut</label>
                <button className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                  Tous
                  <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Réseau</label>
                <button className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                  Tous
                  <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Pays</label>
                <button className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                  Tous
                  <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mb-5">
              <button className="h-9 px-4 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser
              </button>
              <button className="h-9 px-5 rounded-lg bg-afrilink-green text-white text-xs font-medium hover:opacity-90 transition-opacity">
                Filtrer
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-gray-400 border-b border-gray-100">
                    <th className="font-medium pb-3 w-8">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="font-medium pb-3">Bénéficiaire</th>
                    <th className="font-medium pb-3">Numéro</th>
                    <th className="font-medium pb-3">Réseau</th>
                    <th className="font-medium pb-3">Pays</th>
                    <th className="font-medium pb-3">Statut</th>
                    <th className="font-medium pb-3">Ajouté le</th>
                    <th className="font-medium pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {BENEFICIARIES.map((b) => (
                    <tr key={b.phone} className="border-b border-gray-50 last:border-0">
                      <td className="py-3.5">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ${b.avatarBg}`}>
                            {b.initials}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-afrilink-dark">{b.name}</p>
                            {b.favorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-gray-600">{b.phone}</td>
                      <td>
                        <NetworkBadge network={b.network} />
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          {b.country}
                        </div>
                      </td>
                      <td>
                        <Badge tone={b.status === "Vérifié" ? "green" : "orange"} dot>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="text-xs text-gray-500">{b.addedOn}</td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-afrilink-dark"
                            aria-label="Envoyer de l'argent"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-afrilink-dark"
                            aria-label="Plus d'options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-5">
              <p className="text-xs text-gray-400">Affichage de 1 à 5 sur 24 bénéficiaires</p>
              <Pagination page={page} totalPages={5} onChange={setPage} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <SecureIcon className="w-4.5 h-4.5 text-afrilink-green" />
              </span>
              <div>
                <p className="text-xs font-semibold text-afrilink-dark mb-1">Transferts sécurisés</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Vos transferts sont protégés par un chiffrement de bout en bout.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-afrilink-green" />
              </span>
              <div>
                <p className="text-xs font-semibold text-afrilink-dark mb-1">Vérification des bénéficiaires</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Assurez-vous que les informations sont correctes avant d'effectuer un transfert.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Link2 className="w-4.5 h-4.5 text-afrilink-green" />
              </span>
              <div>
                <p className="text-xs font-semibold text-afrilink-dark mb-1">Gestion simplifiée</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Ajoutez, modifiez ou supprimez vos bénéficiaires à tout moment.
                </p>
              </div>
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
}
