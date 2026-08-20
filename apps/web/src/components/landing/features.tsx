import {
  Send,
  Users,
  CreditCard,
  BarChart3,
  Lock,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  MoreHorizontal,
  CheckCircle2,
  ArrowRight,
  UserRound,
} from "lucide-react";

/* ============================================================
   DONNÉES
============================================================ */

// const STATS = [
//   {
//     icon: Users,
//     value: "500K+",
//     label: "Utilisateurs actifs",
//   },
//   {
//     icon: ArrowLeftRight,
//     value: "2M+",
//     label: "Transactions réussies",
//   },
//   {
//     icon: ShieldCheck,
//     value: "100%",
//     label: "Sécurisé",
//   },
//   {
//     icon: Headphones,
//     value: "24/7",
//     label: "Support client",
//   },
// ];

const FEATURES = [
  {
    icon: Send,
    title: "Transfert d'argent",
    desc: "Envoyez et recevez de l'argent rapidement, localement ou à l'international.",
  },
  {
    icon: Users,
    title: "Tontines digitales",
    desc: "Créez ou rejoignez une tontine en quelques clics et gérez vos cotisations facilement.",
  },
  {
    icon: CreditCard,
    title: "Paiement de services",
    desc: "Payez vos factures (électricité, eau, internet, TV...) et bien plus encore.",
  },
  {
    icon: BarChart3,
    title: "Gestion de portefeuille",
    desc: "Suivez vos transactions et gérez votre argent en toute simplicité et en toute sécurité.",
  },
];

const TRANSACTIONS = [
  {
    icon: ArrowDownLeft,
    label: "Transfert reçu",
    sub: "Aujourd'hui",
    amount: "+50 000 XAF",
    color: "text-allness-green",
  },
  {
    icon: Receipt,
    label: "Paiement facture",
    sub: "Hier",
    amount: "-15 000 XAF",
    color: "text-red-500",
  },
  {
    icon: Users,
    label: "Tontine - Ma famille",
    sub: "12 Mai",
    amount: "-10 000 XAF",
    color: "text-red-500",
  },
];

/* ============================================================
   COMPOSANT PRINCIPAL
============================================================ */

export default function Features() {
  return (
    <main className="min-h-screen bg-white text-allness-dark">



      {/* ======================================================
          HERO
      ======================================================= */}

      <section
        id="fonctionnalites"
        className="
          relative
          overflow-hidden
          bg-white
          pt-14
          pb-12
          sm:pt-16
          lg:pt-14
          lg:pb-10
        "
      >

        {/* Décor de fond */}
        <div
          className="
            pointer-events-none
            absolute
            right-[-200px]
            top-[120px]
            h-[600px]
            w-[600px]
            rounded-full
            bg-allness-green/[0.035]
            blur-3xl
          "
        />

        <div
          className="
            mx-auto
            max-w-[1400px]
            px-5
            sm:px-8
            lg:px-12
          "
        >

          <div
            className="
              grid
              items-center
              gap-8
              lg:grid-cols-[1fr_1fr]
              lg:gap-0
            "
          >

            {/* ==================================================
                GAUCHE : CONTENU
            =================================================== */}

            <div
              className="
                relative
                z-20
                max-w-[690px]
                lg:pr-8
              "
            >

              {/* BADGE */}
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-allness-green/10
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-allness-dark
                "
              >
                <ShieldCheck className="h-4 w-4 text-allness-orange" />

                <span>
                  Simple. Rapide. Sécurisé.
                </span>
              </div>


              {/* TITRE */}

              <h1
                className="
                  mt-7
                  max-w-[680px]
                  font-heading
                  text-[clamp(3rem,5.3vw,5.2rem)]
                  font-extrabold
                  leading-[0.98]
                  tracking-[-0.04em]
                  text-allness-dark
                "
              >
                Tout ce dont vous avez
                <br />

                besoin au{" "}
                <span className="text-allness-green">
                  même endroit
                </span>
              </h1>


              {/* DESCRIPTION */}

              <p
                className="
                  mt-7
                  max-w-[650px]
                  text-base
                  leading-7
                  text-foreground/70
                  sm:text-lg
                  sm:leading-8
                "
              >
                Une plateforme complète pour simplifier votre
                quotidien financier. Envoyez, recevez, payez et
                gérez votre argent en toute confiance.
              </p>


              {/* BOUTONS */}

              <div className="mt-8 flex flex-wrap gap-4">

                <a
                  href="/register"
                  className="
                    inline-flex
                    items-center
                    gap-5
                    rounded-full
                    bg-allness-green
                    px-7
                    py-3.5
                    text-base
                    font-bold
                    text-white
                    shadow-lg
                    shadow-allness-green/20
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                  "
                >
                  Créer un compte

                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-allness-dark
                    "
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>


                <a
                  href="#apropos"
                  className="
                    inline-flex
                    items-center
                    gap-4
                    rounded-full
                    border
                    border-allness-dark/20
                    bg-white
                    px-7
                    py-3.5
                    text-base
                    font-semibold
                    text-allness-dark
                    transition-all
                    duration-300
                    hover:border-allness-green
                    hover:bg-allness-green/[0.03]
                  "
                >
                  Découvrir Allness Pay

                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-allness-dark/10
                    "
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>

              </div>


              {/* GARANTIES */}

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  items-center
                  gap-y-4
                  text-sm
                  text-foreground/70
                "
              >

                {/* sécurité */}
                <div className="flex items-center gap-2 pr-5">
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-allness-dark/5
                    "
                  >
                    <Lock className="h-4 w-4 text-allness-dark" />
                  </span>

                  Sécurité à 100%
                </div>

                <span className="hidden h-6 w-px bg-allness-dark/15 sm:block" />

                {/* rapidité */}
                <div className="flex items-center gap-2 px-5">
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-allness-orange/10
                    "
                  >
                    <Zap className="h-4 w-4 text-allness-orange" />
                  </span>

                  Transactions instantanées
                </div>

                <span className="hidden h-6 w-px bg-allness-dark/15 sm:block" />

                {/* conformité */}
                <div className="flex items-center gap-2 pl-5">
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-allness-dark/5
                    "
                  >
                    <ShieldCheck className="h-4 w-4 text-allness-dark" />
                  </span>

                  Conforme & fiable
                </div>

              </div>

            </div>


            {/* ==================================================
                DROITE : MOCKUP TÉLÉPHONE
            =================================================== */}

            <div
              className="
                relative
                flex
                min-h-[580px]
                items-center
                justify-center
                lg:min-h-[600px]
              "
            >

              {/* CARTE allness PAY DERRIÈRE */}

              <div
                className="
                  absolute
                  right-[-20px]
                  top-[56%]
                  z-0
                  hidden
                  h-[165px]
                  w-[300px]
                  rotate-[8deg]
                  rounded-3xl
                  bg-allness-dark
                  p-6
                  shadow-2xl
                  sm:block
                  lg:right-[0]
                "
              >

                {/* Logo carte */}
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    <span
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-allness-orange
                        text-sm
                        font-extrabold
                        text-allness-dark
                      "
                    >
                      A
                    </span>

                    <span className="text-sm font-bold text-white">
                      Allness
                      <span className="text-allness-orange">
                        Pay
                      </span>
                    </span>
                  </div>

                  <span className="text-xl text-white">
                    ◉
                  </span>
                </div>

                <p className="mt-8 text-sm tracking-[0.18em] text-white/80">
                  **** **** **** 1234
                </p>

                <div className="mt-4 flex justify-end">
                  <div className="flex">
                    <span className="h-7 w-7 rounded-full bg-red-500/90" />
                    <span className="-ml-3 h-7 w-7 rounded-full bg-allness-orange" />
                  </div>
                </div>

              </div>


              {/* CERCLE ORANGE */}

              <div
                className="
                  absolute
                  left-[4%]
                  top-[48%]
                  z-0
                  h-[180px]
                  w-[520px]
                  rounded-[50%]
                  border
                  border-allness-orange
                  rotate-[-5deg]
                "
              />


              {/* BOUCLIER */}

              <div
                className="
                  absolute
                  bottom-[40px]
                  left-[8%]
                  z-30
                  flex
                  h-[100px]
                  w-[100px]
                  items-center
                  justify-center
                  rounded-[35px]
                  bg-allness-green
                  shadow-2xl
                  shadow-allness-green/30
                  rotate-[-5deg]
                "
              >
                <div
                  className="
                    absolute
                    inset-[-7px]
                    rounded-[40px]
                    border-2
                    border-allness-orange/70
                  "
                />

                <Lock className="h-11 w-11 text-white" />
              </div>


              {/* TÉLÉPHONE */}

              <div
                className="
                  relative
                  z-20
                  w-[290px]
                  rotate-[5deg]
                  lg:w-[330px]
                "
              >

                {/* contour téléphone */}
                <div
                  className="
                    rounded-[3rem]
                    bg-allness-dark
                    p-2
                    shadow-[0_30px_70px_rgba(8,43,55,0.30)]
                  "
                >

                  {/* écran */}
                  <div
                    className="
                      overflow-hidden
                      rounded-[2.5rem]
                      bg-white
                    "
                  >

                    {/* barre supérieure */}

                    <div className="flex items-center justify-between px-6 pt-3">

                      <span className="text-[9px] font-bold text-allness-dark">
                        9:01
                      </span>

                      <div className="flex items-center gap-1">
                        <span className="h-2 w-3 rounded-sm bg-allness-dark" />
                        <span className="h-2 w-3 rounded-sm bg-allness-dark/60" />
                        <span className="h-2 w-4 rounded-sm bg-allness-dark/40" />
                      </div>

                    </div>


                    {/* HEADER APP */}

                    <div className="bg-allness-dark px-5 pb-6 pt-5">

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="text-[10px] text-white/60">
                            Bonjour, 👋
                          </p>

                          <p className="mt-1 text-[9px] font-medium text-white">
                            Bienvenue sur Allness Pay
                          </p>
                        </div>

                        <div
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-white/10
                          "
                        >
                          <UserRound className="h-4 w-4 text-white" />
                        </div>

                      </div>


                      {/* SOLDE */}

                      <div
                        className="
                          mt-5
                          rounded-2xl
                          bg-white
                          p-4
                          shadow-lg
                        "
                      >

                        <div className="flex items-center justify-between">

                          <span className="text-[8px] text-foreground/50">
                            Solde disponible
                          </span>

                          <span className="text-xs text-foreground/30">
                            ◉
                          </span>

                        </div>

                        <p
                          className="
                            mt-1
                            font-heading
                            text-[22px]
                            font-extrabold
                            text-allness-dark
                          "
                        >
                          245 750{" "}
                          <span className="text-[11px]">
                            XAF
                          </span>
                        </p>

                        <p className="text-[8px] text-foreground/40">
                          ≈ 374,24 EUR
                        </p>

                      </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="px-4 pt-5">

                      <div className="grid grid-cols-4 gap-2">

                        {[
                          {
                            icon: ArrowUpRight,
                            label: "Envoyer",
                          },
                          {
                            icon: ArrowDownLeft,
                            label: "Recevoir",
                          },
                          {
                            icon: Receipt,
                            label: "Payer",
                          },
                          {
                            icon: MoreHorizontal,
                            label: "Plus",
                          },
                        ].map((action) => {
                          const Icon = action.icon;

                          return (
                            <div
                              key={action.label}
                              className="flex flex-col items-center gap-1"
                            >
                              <span
                                className="
                                  flex
                                  h-9
                                  w-9
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-allness-green/10
                                "
                              >
                                <Icon className="h-4 w-4 text-allness-dark" />
                              </span>

                              <span className="text-[8px] text-foreground/60">
                                {action.label}
                              </span>
                            </div>
                          );
                        })}

                      </div>

                    </div>


                    {/* TRANSACTIONS */}

                    <div className="px-5 pb-7 pt-5">

                      <p className="mb-3 text-[10px] font-bold text-allness-dark">
                        Transactions récentes
                      </p>

                      <div className="space-y-3">

                        {TRANSACTIONS.map((transaction) => {
                          const Icon = transaction.icon;

                          return (
                            <div
                              key={transaction.label}
                              className="
                                flex
                                items-center
                                justify-between
                              "
                            >

                              <div className="flex items-center gap-2">

                                <span
                                  className="
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-allness-dark/5
                                  "
                                >
                                  <Icon className="h-3.5 w-3.5 text-allness-dark" />
                                </span>

                                <div>

                                  <p className="text-[8px] font-semibold text-allness-dark">
                                    {transaction.label}
                                  </p>

                                  <p className="text-[7px] text-foreground/40">
                                    {transaction.sub}
                                  </p>

                                </div>

                              </div>

                              <span
                                className={`text-[8px] font-bold ${transaction.color}`}
                              >
                                {transaction.amount}
                              </span>

                            </div>
                          );
                        })}

                      </div>

                    </div>

                  </div>
                </div>

              </div>


              {/* NOTIFICATION TRANSFERT */}

              <div
                className="
                  absolute
                  right-[-10px]
                  top-[18%]
                  z-40
                  rounded-2xl
                  border
                  border-black/[0.04]
                  bg-white
                  px-4
                  py-3
                  shadow-[0_15px_40px_rgba(8,43,55,0.14)]
                  sm:right-[-5px]
                  lg:right-[-20px]
                "
              >

                <div className="flex items-center gap-3">

                  <span
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-allness-green/10
                    "
                  >
                    <CheckCircle2 className="h-5 w-5 text-allness-green" />
                  </span>

                  <div>
                    <p className="text-[10px] font-semibold text-allness-dark">
                      Transfert réussi
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-allness-dark">
                      +50 000 XAF
                    </p>
                  </div>

                </div>

              </div>


              {/* POINTS DÉCORATIFS */}

              <span
                className="
                  absolute
                  right-[12%]
                  top-[12%]
                  h-3
                  w-3
                  rounded-full
                  bg-allness-green
                  shadow-lg
                "
              />

              <span
                className="
                  absolute
                  left-[8%]
                  top-[35%]
                  h-4
                  w-4
                  rounded-full
                  bg-allness-green/20
                "
              />

              <span
                className="
                  absolute
                  right-[2%]
                  bottom-[18%]
                  h-3
                  w-3
                  rounded-full
                  bg-allness-green
                "
              />

            </div>

          </div>
        </div>
      </section>


      {/* ======================================================
          CARTES FONCTIONNALITÉS
      ======================================================= */}

      <section className="bg-white pb-16 lg:pb-24">

        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="
                    group
                    min-h-[270px]
                    rounded-3xl
                    border
                    border-allness-dark/10
                    bg-white
                    p-7
                    shadow-[0_8px_30px_rgba(8,43,55,0.05)]
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:border-allness-green/20
                    hover:shadow-[0_20px_45px_rgba(8,43,55,0.10)]
                  "
                >

                  {/* ICON */}

                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-allness-dark
                      transition-all
                      duration-300
                      group-hover:bg-allness-green
                    "
                  >
                    <Icon className="h-7 w-7 text-allness-orange" />
                  </div>


                  {/* TITRE */}

                  <h3
                    className="
                      mt-6
                      font-heading
                      text-lg
                      font-extrabold
                      text-allness-dark
                    "
                  >
                    {feature.title}
                  </h3>


                  {/* DESCRIPTION */}

                  <p
                    className="
                      mt-3
                      max-w-[280px]
                      text-sm
                      leading-6
                      text-foreground/65
                    "
                  >
                    {feature.desc}
                  </p>


                  {/* LIEN */}

                  <a
                    href="#"
                    className="
                      mt-6
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      font-bold
                      text-allness-dark
                      transition-colors
                      group-hover:text-allness-green
                    "
                  >
                    En savoir plus

                    <ArrowRight
                      className="
                        h-4
                        w-4
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    />
                  </a>

                </article>
              );
            })}

          </div>

        </div>

      </section>

    </main>
  );
}
