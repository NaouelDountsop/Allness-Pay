import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  UserRound,
  Phone,
  Mail,
  Copy,
  MapPin,
  Calendar,
  ShieldCheck,
  Wallet,
  Activity,
  History,
  FileText,
  CircleDollarSign,
  Smartphone,
  X,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { adminService } from "../../lib/api/admin.service";

const TABS = [
  { key: "info", label: "Informations personnelles", icon: UserRound },
  { key: "kyc", label: "Vérification KYC", icon: ShieldCheck },
  { key: "wallets", label: "Comptes & Portefeuilles", icon: Wallet },
  { key: "activity", label: "Activité récente", icon: Activity },
  { key: "history", label: "Historique", icon: History },
  { key: "notes", label: "Notes", icon: FileText },
];

export function UserDetailPanel({ userId, onClose }: { userId?: number; onClose?: () => void }) {
  const [tab, setTab] = useState("info");
  const open = !!userId;

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminService.getUserById(userId!),
    enabled: !!userId,
  });

  const fullName = user ? `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() : 'Utilisateur';
  const initials = user
    ? `${user.prenom?.charAt(0) ?? ''}${user.nom?.charAt(0) ?? ''}`.toUpperCase()
    : 'U';

  return (
    <Dialog open={open} onOpenChange={() => onClose?.()}>
      <DialogContent className="sm:max-w-5xl w-full max-h-[95vh] p-0 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-allness-orange animate-spin" />
          </div>
        ) : (
          <div className="w-full bg-white">
            {/* HEADER */}
            <div className="flex items-start gap-5 px-6 py-5 border-b border-gray-100">
              <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-white shadow">
                <div className="w-full h-full bg-gradient-to-b from-gray-400 to-gray-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${user?.verificationotp ? 'bg-allness-green' : 'bg-allness-orange'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-allness-dark">{fullName}</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${user?.verificationotp ? 'bg-green-50 text-allness-green' : 'bg-orange-50 text-allness-orange'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user?.verificationotp ? 'bg-allness-green' : 'bg-allness-orange'}`} />
                    {user?.verificationotp ? 'Compte Actif' : 'En attente'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    ID Utilisateur : {user?.idutilisateur ?? '—'}
                    <Copy className="w-3 h-3 text-gray-400 cursor-pointer" />
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {user?.telephone ?? '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {user?.email ?? '—'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Membre depuis le {user?.dateinscription ? new Date(user.dateinscription).toLocaleDateString('fr-FR') : '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {user?.ville ?? '—'}, {user?.pays ?? ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8 shrink-0">
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-0.5">Solde principal</p>
                  <p className="text-sm font-bold text-allness-dark">245 750 XAF</p>
                  <a href="#" className="text-[11px] text-allness-green font-medium flex items-center gap-1 justify-center">
                    Voir le portefeuille
                  </a>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-0.5">Dernière activité</p>
                  <p className="text-sm font-medium text-gray-700">Aujourd'hui à 09:42</p>
                  <p className="text-[11px] text-allness-green font-medium">En ligne</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-0.5">Statut</p>
                  <p className="text-sm font-medium text-allness-green">Actif</p>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="flex items-center gap-1 px-6 border-b border-gray-100">
              {TABS.map(({ key, label, icon: Icon }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`relative flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                      active ? "text-allness-green" : "text-gray-500 hover:text-allness-dark"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-allness-green rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* CONTENT */}
            {tab === "info" && (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                  <Card icon={UserRound} title="Informations personnelles">
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="Nom complet" value={fullName} />
                      <Field label="Date de naissance" value={user?.datenaissance ? new Date(user.datenaissance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'} />
                      <Field label="Sexe" value={user?.sexe ?? '—'} />
                      <Field label="Nationalité" value={user?.pays ?? '—'} />
                      <Field label="Profession" value={user?.profession ?? '—'} />
                      <Field label="Statut" value={user?.statut ?? '—'} />
                    </div>
                  </Card>

                  <Card icon={Phone} title="Coordonnées">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Numéro de téléphone" value={user?.telephone ?? '—'} badge="Vérifié" />
                      <Field label="Adresse email" value={user?.email ?? '—'} badge="Vérifié" />
                      <Field label="Adresse physique" value={user?.adresse ?? '—'} />
                      <Field label="Ville" value={`${user?.ville ?? '—'}, ${user?.pays ?? ''}`} />
                    </div>
                  </Card>

                  <Card icon={FileText} title="Informations complémentaires">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Profession" value={user?.profession ?? '—'} />
                      <Field label="Dernière modification" value={user?.datemodification ? new Date(user.datemodification).toLocaleDateString('fr-FR') : '—'} />
                    </div>
                  </Card>
                </div>

                <div className="space-y-5">
                  <ComplianceCard />
                  <StatsCard />
                  <SecurityCard />
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Sous-composants ---------- */

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound;
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

function ComplianceCard() {
  const items = [
    { icon: ShieldCheck, label: "Vérification d'identité", status: "Approuvée", style: "bg-allness-green text-white" },
    { icon: MapPin, label: "Justificatif de domicile", status: "Validé", sub: "15/03/2023", style: "text-gray-600 font-semibold" },
    { icon: CircleDollarSign, label: "Origine des fonds", status: "Auto-déclaré", style: "bg-blue-50 text-blue-600" },
    { icon: ShieldCheck, label: "Vérification AML", status: "Aucun signal", style: "bg-green-50 text-allness-green" },
    { icon: Activity, label: "Score de risque", status: "Faible", style: "bg-green-50 text-allness-green" },
  ];

  return (
    <div className="rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-allness-green" />
        <p className="text-sm font-semibold text-allness-dark">Résumé de conformité</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                <item.icon className="w-3.5 h-3.5 text-allness-green" />
              </span>
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
            {item.sub ? (
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">{item.status}</p>
                <p className="text-[10px] text-gray-400">{item.sub}</p>
              </div>
            ) : (
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${item.style}`}>
                {item.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsCard() {
  return (
    <div className="rounded-lg border border-gray-100 p-4">
      <p className="text-sm font-semibold text-allness-dark mb-4">Statistiques du compte</p>
      <div className="grid grid-cols-2 gap-y-4 text-sm">
        <div>
          <p className="text-[11px] text-gray-400">Total des transactions</p>
          <p className="font-semibold text-allness-dark">128</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">Volume total</p>
          <p className="font-semibold text-allness-dark">4 250 000 XAF</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">Tontines créées</p>
          <p className="font-semibold text-allness-dark">2</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">Tontines rejointes</p>
          <p className="font-semibold text-allness-dark">5</p>
        </div>
      </div>
    </div>
  );
}

function SecurityCard() {
  return (
    <div className="rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="w-4 h-4 text-allness-green" />
        <p className="text-sm font-semibold text-allness-dark">Appareils &amp; sécurité</p>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Appareils enregistrés</span>
          <span className="font-medium text-allness-dark">2</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Dernière connexion</span>
          <span className="font-medium text-allness-dark">Aujourd'hui à 09:42</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Adresse IP</span>
          <span className="font-medium text-allness-dark">197.210.14.23</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Authentification 2FA</span>
          <span className="text-[10px] font-semibold text-allness-green bg-green-50 px-2 py-1 rounded-full">
            Activée
          </span>
        </div>
      </div>
    </div>
  );
}
