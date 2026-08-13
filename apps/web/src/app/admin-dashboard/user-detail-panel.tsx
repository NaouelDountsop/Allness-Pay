import { useState } from "react";
import {
  X,
  UserRound,
  Phone,
  MapPin,
  ShieldCheck,
  WalletCards,
  Activity,
  Ban,
  RotateCcw,
  CheckCircle2,
  CircleDollarSign,
} from "lucide-react";

interface UserDetailPanelProps {
  onClose: () => void;
}

const TABS = [
  "Informations Personnelles",
  "Portefeuilles",
  "Activité Récente",
];

export function UserDetailPanel({
  onClose,
}: UserDetailPanelProps) {
  const [tab, setTab] = useState("Informations Personnelles");

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/55
        p-2
        sm:p-4
      "
    >
      {/* =====================================================
          PANNEAU PRINCIPAL
      ====================================================== */}

      <div
        className="
          relative
          flex
          h-[calc(100vh-16px)]
          max-h-[730px]
          w-full
          max-w-[390px]
          flex-col
          overflow-hidden
          rounded-none
          bg-white
          shadow-[0_20px_60px_rgba(0,0,0,0.30)]
          sm:h-auto
          sm:max-h-[calc(100vh-32px)]
          sm:rounded-sm
        "
      >

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="shrink-0 bg-[#073846] px-4 pb-4 pt-4">

          <div className="flex items-start justify-between">

            {/* Avatar + identité */}
            <div className="flex items-center gap-3">

              {/* Avatar */}
              <div
                className="
                  relative
                  flex
                  h-[52px]
                  w-[52px]
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border-2
                  border-white
                  bg-[#dce7e9]
                "
              >
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    bg-gradient-to-b
                    from-[#526c78]
                    to-[#173b47]
                  "
                >
                  <UserRound className="h-8 w-8 text-white/90" />
                </div>

                {/* statut en ligne */}
                <span
                  className="
                    absolute
                    bottom-0
                    right-0
                    h-3
                    w-3
                    rounded-full
                    border-2
                    border-white
                    bg-[#20b878]
                  "
                />
              </div>

              {/* Nom / badges */}
              <div className="min-w-0">

                <h2
                  className="
                    truncate
                    font-heading
                    text-[15px]
                    font-bold
                    leading-tight
                    text-afrilink-orange
                  "
                >
                  John Doe
                </h2>

                <p className="mt-1 text-[9px] text-white/60">
                  ID: FG-9842551-JD
                </p>

                <div className="mt-1.5 flex items-center gap-1.5">

                  {/* Compte actif */}
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      bg-[#d8f6e7]
                      px-2
                      py-[3px]
                      text-[8px]
                      font-semibold
                      text-[#17965d]
                    "
                  >
                    <span className="h-[5px] w-[5px] rounded-full bg-[#20b878]" />
                    Compte Actif
                  </span>

                  {/* KYC */}
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      bg-[#e6e0ff]
                      px-2
                      py-[3px]
                      text-[8px]
                      font-semibold
                      text-[#5c45b5]
                    "
                  >
                    <span className="h-[5px] w-[5px] rounded-full bg-[#654bd0]" />
                    KYC Niveau 2
                  </span>

                </div>
              </div>
            </div>

            {/* Fermer */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="
                ml-3
                mt-1
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                rounded-full
                text-white/35
                transition-colors
                hover:bg-white/10
                hover:text-white/80
              "
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>


        {/* ===================================================
            ONGLET
        ==================================================== */}

        <div
          className="
            flex
            h-[28px]
            shrink-0
            border-b
            border-gray-200
            bg-white
          "
        >
          {TABS.map((item) => {
            const active = tab === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`
                  relative
                  flex-1
                  whitespace-nowrap
                  px-1
                  text-[7px]
                  font-medium
                  transition-colors
                  ${
                    active
                      ? "text-afrilink-orange"
                      : "text-gray-500 hover:text-afrilink-dark"
                  }
                `}
              >
                {item}

                {active && (
                  <span
                    className="
                      absolute
                      bottom-0
                      left-1/2
                      h-[2px]
                      w-[70%]
                      -translate-x-1/2
                      rounded-full
                      bg-afrilink-orange
                    "
                  />
                )}
              </button>
            );
          })}
        </div>


        {/* ===================================================
            CONTENU
        ==================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            bg-white
            px-3
            py-3
            scrollbar-thin
          "
        >

          {/* =================================================
              INFORMATIONS PERSONNELLES
          ================================================== */}

          {tab === "Informations Personnelles" && (
            <div className="flex flex-col gap-3">

              {/* IDENTITÉ */}
              <div
                className="
                  rounded-md
                  border
                  border-[#f0a44b]
                  bg-white
                  px-3
                  py-3
                "
              >

                <SectionTitle
                  icon={<UserRound className="h-3 w-3" />}
                  title="IDENTITÉ"
                />

                <div className="mt-3 grid grid-cols-3 gap-3">

                  <InfoField
                    label="Nom complet"
                    value="John Doe"
                  />

                  <InfoField
                    label="Date de naissance"
                    value="12 Mai 1985"
                  />

                  <InfoField
                    label="Sexe"
                    value="Masculin"
                  />

                </div>
              </div>


              {/* COORDONNÉES */}
              <div
                className="
                  rounded-md
                  border
                  border-gray-200
                  bg-white
                  px-3
                  py-3
                "
              >

                <SectionTitle
                  icon={<Phone className="h-3 w-3" />}
                  title="COORDONNÉES"
                />

                <div className="mt-3 grid grid-cols-2 gap-3">

                  <InfoField
                    label="Numéro de téléphone"
                    value="+237 670 00 00 00"
                  />

                  <InfoField
                    label="Adresse email"
                    value="j.doe@example.com"
                  />

                </div>
              </div>


              {/* LOCALISATION */}
              <div
                className="
                  rounded-md
                  border
                  border-gray-200
                  bg-white
                  px-3
                  py-3
                "
              >

                <SectionTitle
                  icon={<MapPin className="h-3 w-3" />}
                  title="LOCALISATION"
                />

                <div className="mt-3 grid grid-cols-2 gap-3">

                  <InfoField
                    label="Ville & Pays"
                    value="Douala, Cameroun"
                  />

                  <InfoField
                    label="Adresse"
                    value="BP..."
                  />

                </div>
              </div>


              {/* =================================================
                  RÉSUMÉ DE CONFORMITÉ
              ================================================== */}

              <div
                className="
                  rounded-md
                  border
                  border-[#cbdede]
                  bg-[#e4f0f0]
                  px-3
                  py-3
                "
              >

                <p
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-afrilink-orange
                  "
                >
                  RÉSUMÉ DE CONFORMITÉ
                </p>

                <div className="mt-3 flex flex-col gap-3">

                  {/* Identité */}
                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span
                        className="
                          flex
                          h-4
                          w-4
                          items-center
                          justify-center
                          rounded-full
                          bg-[#d0f6df]
                        "
                      >
                        <ShieldCheck className="h-2.5 w-2.5 text-[#18ad68]" />
                      </span>

                      <span className="text-[9px] text-gray-600">
                        Vérification d'identité
                      </span>

                    </div>

                    <span
                      className="
                        rounded-full
                        bg-[#1bbd70]
                        px-2
                        py-1
                        text-[6px]
                        font-bold
                        uppercase
                        text-white
                      "
                    >
                      APPROUVÉE
                    </span>

                  </div>


                  {/* Adresse */}
                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span
                        className="
                          flex
                          h-4
                          w-4
                          items-center
                          justify-center
                          rounded-full
                          bg-[#d0f6df]
                        "
                      >
                        <MapPin className="h-2.5 w-2.5 text-[#18ad68]" />
                      </span>

                      <span className="text-[9px] text-gray-600">
                        Justificatif de domicile
                      </span>

                    </div>

                    <div className="text-right">

                      <p className="text-[8px] font-semibold text-gray-600">
                        Validé
                      </p>

                      <p className="text-[6px] text-gray-400">
                        15/03/23
                      </p>

                    </div>

                  </div>


                  {/* Origine des fonds */}
                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span
                        className="
                          flex
                          h-4
                          w-4
                          items-center
                          justify-center
                          rounded-full
                          bg-gray-100
                        "
                      >
                        <CircleDollarSign className="h-2.5 w-2.5 text-gray-500" />
                      </span>

                      <span className="text-[9px] text-gray-600">
                        Origine des fonds
                      </span>

                    </div>

                    <span
                      className="
                        rounded-full
                        bg-[#e9efff]
                        px-2
                        py-1
                        text-[6px]
                        font-medium
                        uppercase
                        text-gray-500
                      "
                    >
                      AUTO-DÉCLARÉ
                    </span>

                  </div>

                </div>
              </div>

            </div>
          )}


          {/* =================================================
              PORTEFEUILLES
          ================================================== */}

          {tab === "Portefeuilles" && (
            <div className="flex flex-col gap-3">

              <div
                className="
                  rounded-md
                  border
                  border-gray-200
                  bg-white
                  p-4
                "
              >

                <SectionTitle
                  icon={<WalletCards className="h-3 w-3" />}
                  title="PORTEFEUILLES"
                />

                <div className="mt-4 rounded-md bg-afrilink-dark p-4">

                  <p className="text-[9px] text-white/60">
                    Solde principal
                  </p>

                  <p className="mt-1 text-xl font-bold text-white">
                    245 750 XAF
                  </p>

                  <p className="mt-1 text-[8px] text-white/50">
                    Portefeuille principal
                  </p>

                </div>

              </div>

              <div
                className="
                  rounded-md
                  border
                  border-gray-200
                  bg-white
                  p-4
                "
              >

                <p className="text-[8px] font-bold uppercase text-afrilink-orange">
                  INFORMATIONS DU PORTEFEUILLE
                </p>

                <div className="mt-3 flex flex-col gap-3">

                  <InfoField
                    label="Devise"
                    value="XAF"
                  />

                  <InfoField
                    label="Statut"
                    value="Actif"
                  />

                </div>

              </div>

            </div>
          )}


          {/* =================================================
              ACTIVITÉ RÉCENTE
          ================================================== */}

          {tab === "Activité Récente" && (
            <div className="flex flex-col gap-3">

              <div
                className="
                  rounded-md
                  border
                  border-gray-200
                  bg-white
                  p-4
                "
              >

                <SectionTitle
                  icon={<Activity className="h-3 w-3" />}
                  title="ACTIVITÉ RÉCENTE"
                />

                <div className="mt-4 flex flex-col gap-4">

                  <ActivityRow
                    title="Connexion au compte"
                    date="Aujourd'hui à 09:42"
                  />

                  <ActivityRow
                    title="Transfert effectué"
                    date="Hier à 16:25"
                  />

                  <ActivityRow
                    title="Paiement de service"
                    date="12/05/2026 à 14:10"
                  />

                </div>

              </div>

            </div>
          )}

        </div>


        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-gray-200
            bg-[#f5f7ff]
            px-3
            py-3
          "
        >

          <div className="grid grid-cols-3 gap-2">

            {/* Suspendre */}
            <button
              type="button"
              className="
                flex
                h-9
                items-center
                justify-center
                gap-1
                rounded-md
                border
                border-red-200
                bg-[#fff0f0]
                px-2
                text-[8px]
                font-medium
                text-red-500
                transition-colors
                hover:bg-red-100
              "
            >
              <Ban className="h-3 w-3" />
              Suspendre le compte
            </button>


            {/* PIN */}
            <button
              type="button"
              className="
                flex
                h-9
                items-center
                justify-center
                gap-1
                rounded-md
                border
                border-gray-300
                bg-white
                px-2
                text-[8px]
                font-medium
                text-gray-600
                transition-colors
                hover:bg-gray-50
              "
            >
              <RotateCcw className="h-3 w-3" />
              Réinitialiser le PIN
            </button>


            {/* Fermer */}
            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                items-center
                justify-center
                gap-1
                rounded-md
                bg-afrilink-green
                px-2
                text-[8px]
                font-medium
                text-white
                shadow-sm
                transition-all
                hover:bg-afrilink-greenHover
                hover:shadow-md
              "
            >
              Fermer le profil
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}


/* ============================================================
   SOUS-COMPOSANTS
============================================================ */

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-afrilink-orange">
        {icon}
      </span>

      <span
        className="
          text-[8px]
          font-bold
          uppercase
          tracking-wide
          text-afrilink-orange
        "
      >
        {title}
      </span>
    </div>
  );
}


function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">

      <p className="text-[7px] leading-3 text-gray-500">
        {label}
      </p>

      <p
        className="
          mt-0.5
          truncate
          text-[8px]
          font-medium
          leading-4
          text-afrilink-dark
        "
      >
        {value}
      </p>

    </div>
  );
}


function ActivityRow({
  title,
  date,
}: {
  title: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0">

      <span
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-afrilink-green/10
        "
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-afrilink-green" />
      </span>

      <div>
        <p className="text-[9px] font-semibold text-afrilink-dark">
          {title}
        </p>

        <p className="mt-0.5 text-[7px] text-gray-400">
          {date}
        </p>
      </div>

    </div>
  );
}