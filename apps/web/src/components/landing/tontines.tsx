import {
  ArrowRight,
  Users,
  ShieldCheck,
  Lock,
  RefreshCw,
  Bell,
  TrendingUp,
} from "lucide-react";


const PIGGY_IMG = "../../public/piggy-tontine.png";

const STATS = [
  {
    icon: ShieldCheck,
    title: "100% Transparent",
    desc: "Suivi en temps réel de toutes les opérations",
  },
  {
    icon: Lock,
    title: "Sécurisé Garanti",
    desc: "Vos fonds protégés et sécurisés",
  },
  {
    icon: RefreshCw,
    title: "Flexible Cycle libre",
    desc: "Tontines adaptées à vos besoins",
  },
];

const FEATURES = [
  {
    icon: Users,
    title: "Créez ou rejoignez",
    desc: "une tontine en quelques clics",
  },
  {
    icon: ShieldCheck,
    title: "Invitez et gérez",
    desc: "les membres facilement",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "à chaque étape clé",
  },
  {
    icon: TrendingUp,
    title: "Réseau de confiance",
    desc: "pour plus de sérénité",
  },
];

export default function Tontines() {
  return (
    <section
      id="tontines"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">

        {/* =========================================================
            HERO : TEXTE À GAUCHE / IMAGE À DROITE
        ========================================================== */}
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">

          {/* =====================================================
              COLONNE GAUCHE
          ====================================================== */}
          <div className="relative z-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-3 rounded-full bg-afrilink-green/10 px-5 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-afrilink-dark">
                <Users className="h-5 w-5" />
              </span>

              <span className="text-xs font-bold uppercase tracking-wide text-afrilink-dark sm:text-sm">
                Épargnez ensemble, réalisez plus
              </span>
            </div>

            {/* Titre */}
            <h2
              className="
                mt-7
                max-w-xl
                font-heading
                text-[clamp(3rem,6vw,5.4rem)]
                font-extrabold
                leading-[0.95]
                tracking-tight
              "
            >
              <span className="block text-afrilink-dark">
                Tontines
              </span>

              <span className="block text-afrilink-orange">
                Digitales
              </span>
            </h2>

            {/* Description */}
            <p
              className="
                mt-7
                max-w-xl
                text-base
                leading-7
                text-foreground/70
                sm:text-lg
                sm:leading-8
              "
            >
              Épargnez à plusieurs, atteignez vos objectifs plus vite.
              Notre plateforme de tontines digitales sécurisée et
              transparente vous permet de bâtir votre avenir ensemble.
            </p>

            {/* Bouton */}
            <a
              href="#tontines"
              className="
                mt-7
                inline-flex
                items-center
                gap-3
                rounded-full
                bg-afrilink-green
                px-7
                py-4
                text-sm
                font-bold
                text-white
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-afrilink-greenHover
                hover:shadow-lg
              "
            >
              En savoir plus

              <ArrowRight className="h-5 w-5" />
            </a>

            {/* =================================================
                3 STATISTIQUES
            ================================================== */}
            <div className="mt-8 grid max-w-[680px] grid-cols-1 gap-3 sm:grid-cols-3">

              {STATS.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="
                      rounded-2xl
                      border
                      border-afrilink-dark/10
                      bg-white
                      p-5
                      shadow-[0_8px_30px_rgba(8,43,55,0.06)]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-[0_15px_35px_rgba(8,43,55,0.10)]
                    "
                  >
                    {/* Icon */}
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        bg-afrilink-green/10
                      "
                    >
                      <Icon className="h-5 w-5 text-afrilink-green" />
                    </div>

                    {/* Titre */}
                    <p
                      className="
                        mt-4
                        font-heading
                        text-sm
                        font-extrabold
                        leading-5
                        text-afrilink-dark
                      "
                    >
                      {stat.title}
                    </p>

                    {/* Description */}
                    <p
                      className="
                        mt-2
                        text-xs
                        leading-5
                        text-foreground/60
                      "
                    >
                      {stat.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* =================================================
                CARTE RYTHME
            ================================================== */}
            <div
              className="
                mt-4
                flex
                max-w-[680px]
                items-center
                gap-4
                rounded-2xl
                border
                border-afrilink-green/10
                bg-afrilink-green/[0.045]
                px-5
                py-4
                transition-all
                duration-300
                hover:bg-afrilink-green/[0.08]
              "
            >
              {/* Icon */}
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-afrilink-green/10
                "
              >
                <Users className="h-6 w-6 text-afrilink-dark" />
              </div>

              {/* Texte */}
              <div className="min-w-0 flex-1">
                <p
                  className="
                    font-heading
                    text-sm
                    font-extrabold
                    text-afrilink-dark
                    sm:text-base
                  "
                >
                  Tontines hebdomadaires ou mensuelles
                </p>

                <p className="mt-1 text-xs text-foreground/60 sm:text-sm">
                  Choisissez le rythme qui vous convient le mieux.
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight
                className="
                  h-6
                  w-6
                  shrink-0
                  text-afrilink-orange
                "
              />
            </div>
          </div>

          {/* =====================================================
              COLONNE DROITE : IMAGE
          ====================================================== */}
          <div
            className="
              relative
              flex
              min-h-[500px]
              items-center
              justify-center
              lg:min-h-[680px]
            "
          >

            {/* Grand cercle lumineux */}
            {/* <div
              className="
                absolute
                right-[3%]
                top-[8%]
                h-[80%]
                w-[80%]
                rounded-full
                bg-afrilink-green/[0.07]
                blur-[2px]
              "
            /> */}

            {/* Halo */}
            {/* <div
              className="
                absolute
                right-[12%]
                top-[15%]
                h-[65%]
                w-[65%]
                rounded-full
                bg-afrilink-green/[0.06]
                blur-3xl
              "
            /> */}

            {/* Cercle décoratif orange */}
            {/* <div
              className="
                absolute
                right-[7%]
                top-[5%]
                h-[78%]
                w-[78%]
                rounded-full
                border-2
                border-dashed
                border-afrilink-orange/70
              "
            /> */}

            {/* Petite flèche décorative */}
            {/* <div
              className="
                absolute
                right-[9%]
                top-[4%]
                z-10
                rotate-[-20deg]
                text-afrilink-orange
              "
            >
              <ArrowRight className="h-8 w-8" />
            </div> */}

            {/* Petits points */}
            {/* <div
              className="
                absolute
                right-0
                top-[18%]
                grid
                grid-cols-4
                gap-3
                opacity-40
              "
            >
              {Array.from({ length: 20 }).map((_, index) => (
                <span
                  key={index}
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-afrilink-green/30
                  "
                />
              ))}
            </div> */}

            {/* Illustration */}
            <img
              src={PIGGY_IMG}
              alt="Tirelire digitale AllnessPay"
              className="
                relative
                z-10
                w-full
                max-w-[720px]
                object-contain
                drop-shadow-[0_25px_35px_rgba(8,43,55,0.12)]
                transition-transform
                duration-500
                hover:scale-[1.02]
              "
            />
          </div>
        </div>

        {/* =========================================================
            FEATURES : GRANDE BARRE HORIZONTALE
        ========================================================== */}
        <div
          className="
            relative
            z-20
            mt-12
            overflow-hidden
            rounded-3xl
            border
            border-afrilink-dark/10
            bg-white
            shadow-[0_10px_35px_rgba(8,43,55,0.07)]
          "
        >
          <div className="grid grid-cols-1 divide-y divide-afrilink-dark/10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-y-0">

            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="
                    group
                    flex
                    items-center
                    gap-4
                    px-6
                    py-6
                    transition-all
                    duration-300
                    hover:bg-afrilink-green/[0.035]
                  "
                >

                  {/* Icon */}
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-afrilink-green/10
                      transition-all
                      duration-300
                      group-hover:scale-105
                      group-hover:bg-afrilink-green/15
                    "
                  >
                    <Icon
                      className="
                        h-6
                        w-6
                        text-afrilink-dark
                        transition-colors
                        duration-300
                        group-hover:text-afrilink-green
                      "
                    />
                  </div>

                  {/* Texte */}
                  <div>
                    <p
                      className="
                        font-heading
                        text-sm
                        font-extrabold
                        text-afrilink-dark
                      "
                    >
                      {feature.title}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-foreground/60
                        sm:text-sm
                      "
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
