import { useState } from "react";
import {
  UserRound,
  Phone,
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
  ExternalLink,
} from "lucide-react";

const TABS = [
  { key: "info", label: "Informations personnelles", icon: UserRound },
  { key: "kyc", label: "Vérification KYC", icon: ShieldCheck },
  { key: "wallets", label: "Comptes & Portefeuilles", icon: Wallet },
  { key: "activity", label: "Activité récente", icon: Activity },
  { key: "history", label: "Historique", icon: History },
  { key: "notes", label: "Notes", icon: FileText },
];

export function UserDetailPanel() {
  const [tab, setTab] = useState("info");

  return (
    <div className="w-full bg-white">
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-white shadow">
              <div className="w-full h-full bg-gradient-to-b from-gray-400 to-gray-600 flex items-center justify-center">
                <UserRound className="w-9 h-9 text-white/90" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-afrilink-green border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-afrilink-dark">John Doe</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-afrilink-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-afrilink-green" />
                  Compte Actif
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  KYC Niveau 2
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  ID Utilisateur : USR-000245
                  <Copy className="w-3 h-3 text-gray-400 cursor-pointer" />
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> +237 670 00 00 00
                </span>
                <span className="flex items-center gap-1">
                  ✉️ j.doe@example.com
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Membre depuis le 12 Janv. 2023 · 14:32
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Douala, Cameroun
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 shrink-0">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Solde principal</p>
              <p className="text-sm font-bold text-afrilink-dark">245 750 XAF</p>
              <a href="#" className="text-[11px] text-afrilink-green font-medium flex items-center gap-1">
                Voir le portefeuille <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Dernière activité</p>
              <p className="text-sm font-medium text-gray-700">Aujourd'hui à 09:42</p>
              <p className="text-[11px] text-afrilink-green font-medium">En ligne</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Statut</p>
              <p className="text-sm font-medium text-afrilink-green">Actif</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 px-6 border-b border-gray-100 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                active ? "text-afrilink-green" : "text-gray-500 hover:text-afrilink-dark"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-afrilink-green rounded-full" />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Nom complet" value="John Doe" />
                <Field label="Date de naissance" value="12 Mai 1985" />
                <Field label="Sexe" value="Masculin" />
                <Field label="Pièce d'identité" value="Passeport" />
                <Field label="Numéro de pièce" value="A123456789" />
                <Field label="Nationalité" value="Camerounaise" />
              </div>
            </Card>

            <Card icon={Phone} title="Coordonnées">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Numéro de téléphone" value="+237 670 00 00 00" badge="Vérifié" />
                <Field label="Adresse email" value="j.doe@example.com" badge="Vérifié" />
                <Field label="Adresse physique" value={"Douala, Bonapriso\nBP: 1234 Douala, Cameroun"} />
                <Field label="Langue préférée" value="Français" />
              </div>
            </Card>

            <Card icon={FileText} title="Informations complémentaires">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Profession" value="Entrepreneur" />
                <Field label="Source de revenus" value="Commerce" />
                <Field label="Revenu mensuel estimé" value="500 000 - 1 000 000 XAF" />
                <Field label="Motif d'utilisation" value="Transfert, paiement et épargne" />
                <Field label="Parrain (si applicable)" value="Aucun" />
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
        <Icon className="w-4 h-4 text-afrilink-green" />
        <p className="text-sm font-semibold text-afrilink-dark">{title}</p>
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
        <p className="text-sm font-medium text-afrilink-dark whitespace-pre-line">{value}</p>
        {badge && (
          <span className="text-[10px] font-medium text-afrilink-green bg-green-50 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function ComplianceCard() {
  const items = [
    { icon: ShieldCheck, label: "Vérification d'identité", status: "Approuvée", style: "bg-afrilink-green text-white" },
    { icon: MapPin, label: "Justificatif de domicile", status: "Validé", sub: "15/03/2023", style: "text-gray-600 font-semibold" },
    { icon: CircleDollarSign, label: "Origine des fonds", status: "Auto-déclaré", style: "bg-blue-50 text-blue-600" },
    { icon: ShieldCheck, label: "Vérification AML", status: "Aucun signal", style: "bg-green-50 text-afrilink-green" },
    { icon: Activity, label: "Score de risque", status: "Faible", style: "bg-green-50 text-afrilink-green" },
  ];

  return (
    <div className="rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-afrilink-green" />
        <p className="text-sm font-semibold text-afrilink-dark">Résumé de conformité</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                <item.icon className="w-3.5 h-3.5 text-afrilink-green" />
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
      <p className="text-sm font-semibold text-afrilink-dark mb-4">Statistiques du compte</p>
      <div className="grid grid-cols-2 gap-y-4 text-sm">
        <div>
          <p className="text-[11px] text-gray-400">Total des transactions</p>
          <p className="font-semibold text-afrilink-dark">128</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">Volume total</p>
          <p className="font-semibold text-afrilink-dark">4 250 000 XAF</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">Tontines créées</p>
          <p className="font-semibold text-afrilink-dark">2</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">Tontines rejointes</p>
          <p className="font-semibold text-afrilink-dark">5</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400">3</p>
        </div>
      </div>
    </div>
  );
}

function SecurityCard() {
  return (
    <div className="rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="w-4 h-4 text-afrilink-green" />
        <p className="text-sm font-semibold text-afrilink-dark">Appareils &amp; sécurité</p>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Appareils enregistrés</span>
          <span className="font-medium text-afrilink-dark">2</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Dernière connexion</span>
          <span className="font-medium text-afrilink-dark">Aujourd'hui à 09:42</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Adresse IP</span>
          <span className="font-medium text-afrilink-dark">197.210.14.23</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Authentification 2FA</span>
          <span className="text-[10px] font-semibold text-afrilink-green bg-green-50 px-2 py-1 rounded-full">
            Activée
          </span>
        </div>
      </div>
    </div>
  );
}