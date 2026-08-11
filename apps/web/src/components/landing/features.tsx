import {
  Send,
  Users,
  CreditCard,
  BarChart3,
  Check,
  Lock,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  MoreHorizontal,
  Wallet,
  CheckCircle2,
} from "lucide-react";

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
    desc: "Suivez vos transactions et gérez votre argent en toute simplicité.",
  },
];

const TRANSACTIONS = [
  { label: "Transfert reçu", sub: "Aujourd'hui", amount: "+50 000 XAF", color: "text-afrilink-green" },
  { label: "Paiement facture", sub: "Hier", amount: "-15 000 XAF", color: "text-afrilink-red" },
  { label: "Tontine - Ma famille", sub: "12 Mai", amount: "-10 000 XAF", color: "text-afrilink-red" },
];

export default function Features() {
  return (
    <section id="fonctionnalites" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Top part: text + phone */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Left: text content */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 bg-afrilink-green/10 text-afrilink-green text-sm font-semibold px-4 py-2 rounded-full">
              <Check className="h-4 w-4" />
              Simple. Rapide. Sécurisé.
            </span>

            <h2 className="mt-6 font-heading font-extrabold text-[clamp(1.75rem,3.5vw,2.75rem)] text-afrilink-dark text-balance leading-tight">
              Tout ce dont vous avez besoin au même endroit
            </h2>

            <p className="mt-4 text-foreground/60 text-base lg:text-lg leading-relaxed max-w-lg">
              Une plateforme complète pour simplifier votre quotidien financier.
              Envoyez, recevez, payez et gérez votre argent en toute confiance.
            </p>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-foreground/70">
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-afrilink-dark">
                  <Lock className="h-3.5 w-3.5 text-afrilink-orange" />
                </span>
                Sécurisé à 100%
              </span>
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-afrilink-dark">
                  <Zap className="h-3.5 w-3.5 text-afrilink-orange" />
                </span>
                Transactions instantanées
              </span>
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-afrilink-dark">
                  <ShieldCheck className="h-3.5 w-3.5 text-afrilink-orange" />
                </span>
                Conforme &amp; fiable
              </span>
            </div>
          </div>

          {/* Right: phone mockup with wallet */}
          <div className="relative animate-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="relative mx-auto max-w-sm">
              {/* Shield behind phone */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-0">
                <div className="relative">
                  {/* Animated gold ring */}
                  <div className="absolute inset-[-8px] rounded-full border-2 border-afrilink-orange/60 animate-spin-slow" />
                  <div className="absolute inset-[-16px] rounded-full border border-afrilink-orange/30 animate-spin-slow-reverse" />
                  {/* Shield */}
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-afrilink-green shadow-lg shadow-afrilink-green/30">
                    <Lock className="h-9 w-9 text-white" />
                  </div>
                </div>
              </div>

              {/* Phone frame */}
              <div className="relative ml-8 z-10">
                <div className="rounded-[2.5rem] bg-afrilink-dark p-2 shadow-2xl">
                  <div className="rounded-[2rem] bg-white overflow-hidden">
                    {/* Phone status bar */}
                    <div className="flex items-center justify-between px-6 pt-3 pb-1">
                      <span className="text-[10px] font-semibold text-afrilink-dark">6:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2.5 rounded-sm bg-afrilink-dark/80" />
                        <div className="w-3 h-2.5 rounded-sm bg-afrilink-dark/60" />
                        <div className="w-5 h-2.5 rounded-sm bg-afrilink-dark/40" />
                      </div>
                    </div>

                    {/* Wallet header */}
                    <div className="px-5 pt-2 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-foreground/50">Bonjour, 👋</p>
                          <p className="text-[10px] text-foreground/40">Bienvenue sur AfriLink Pay</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-afrilink-dark/10 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-afrilink-green/20" />
                        </div>
                      </div>

                      {/* Balance */}
                      <div className="mt-4">
                        <p className="text-[10px] text-foreground/50 flex items-center gap-1">
                          Solde disponible
                          <svg className="h-3 w-3 text-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                          </svg>
                        </p>
                        <p className="font-heading font-extrabold text-2xl text-afrilink-dark mt-1">
                          245 750 <span className="text-base font-bold">XAF</span>
                        </p>
                        <p className="text-[10px] text-foreground/40 mt-0.5">≈ 374,24 EUR</p>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {[
                          { icon: ArrowUpRight, label: "Envoyer", bg: "bg-afrilink-green" },
                          { icon: ArrowDownLeft, label: "Recevoir", bg: "bg-afrilink-dark" },
                          { icon: Receipt, label: "Payer", bg: "bg-afrilink-dark" },
                          { icon: MoreHorizontal, label: "Plus", bg: "bg-afrilink-dark/10" },
                        ].map((a) => (
                          <div key={a.label} className="flex flex-col items-center gap-1.5">
                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.bg} transition-transform duration-200 hover:scale-105 active:scale-95`}>
                              <a.icon className="h-4.5 w-4.5 text-white" />
                            </span>
                            <span className="text-[9px] text-foreground/60 font-medium">{a.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Transactions */}
                    <div className="px-5 pb-5">
                      <p className="text-[11px] font-semibold text-afrilink-dark mb-2">Transactions récentes</p>
                      <div className="space-y-2">
                        {TRANSACTIONS.map((t) => (
                          <div key={t.label} className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-afrilink-dark/5">
                                <Wallet className="h-3.5 w-3.5 text-afrilink-green" />
                              </span>
                              <div>
                                <p className="text-[11px] font-medium text-afrilink-dark leading-tight">{t.label}</p>
                                <p className="text-[9px] text-foreground/40">{t.sub}</p>
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold ${t.color}`}>{t.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating transfer success card */}
              <div className="absolute -top-2 -right-4 lg:-right-8 z-20 animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="bg-white rounded-xl shadow-xl px-3 py-2.5 flex items-center gap-2.5 border border-border">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-afrilink-green/10">
                    <CheckCircle2 className="h-4 w-4 text-afrilink-green" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-afrilink-dark leading-tight">Transfert réussi</p>
                    <p className="text-[11px] font-bold text-afrilink-green leading-tight">+50 000 XAF</p>
                  </div>
                </div>
              </div>

              {/* Dotted arc decoration */}
              <svg className="absolute -top-4 -right-2 w-24 h-16 overflow-visible" viewBox="0 0 100 60">
                <path
                  d="M10 50 Q 50 -10, 90 30"
                  stroke="#D28E2F"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="4 4"
                  className="animate-dash"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom: 4 feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group bg-white border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 hover:border-afrilink-green/30 transition-all duration-300 cursor-pointer"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-afrilink-dark group-hover:bg-afrilink-green transition-colors duration-300">
                  <Icon className="h-7 w-7 text-afrilink-orange" />
                </span>
                <h3 className="mt-5 font-heading font-bold text-lg text-afrilink-dark group-hover:text-afrilink-green transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-foreground/60 leading-relaxed">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-afrilink-dark group-hover:text-afrilink-green transition-colors duration-300">
                  En savoir plus <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
