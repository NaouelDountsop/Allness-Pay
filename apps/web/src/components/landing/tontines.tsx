import { ArrowRight, Users, ShieldCheck, Lock, RefreshCw, Bell, TrendingUp } from 'lucide-react';

const PIGGY_IMG =
  'https://media.base44.com/images/public/6a79f10b5afc47c1eeaa932f/9f042be5e_generated_image.png';

const STATS = [
  {
    icon: ShieldCheck,
    title: '100% Transparent',
    desc: 'Suivi en temps réel de toutes les opérations',
  },
  {
    icon: Lock,
    title: 'Sécurisé Garanti',
    desc: 'Vos fonds protégés et sécurisés',
  },
  {
    icon: RefreshCw,
    title: 'Flexible Cycle libre',
    desc: 'Tontines adaptées à vos besoins',
  },
];

const FEATURES = [
  {
    icon: Users,
    title: 'Créez ou rejoignez',
    desc: 'une tontine en quelques clics',
  },
  {
    icon: ShieldCheck,
    title: 'Invitez et gérez',
    desc: 'les membres facilement',
  },
  {
    icon: Bell,
    title: 'Notifications',
    desc: 'à chaque étape clé',
  },
  {
    icon: TrendingUp,
    title: 'Réseau de confiance',
    desc: 'pour plus de sérénité',
  },
];

export default function Tontines() {
  return (
    <section id="tontines" className="bg-muted py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Top part: text + image */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text content */}
          <div className="animate-fade-up">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-afrilink-dark text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" />
              Épargnez ensemble, réalisez plus
            </span>

            {/* Headline */}
            <h2 className="mt-6 font-heading font-extrabold text-[clamp(2rem,4.5vw,3.25rem)] text-balance leading-tight">
              <span className="text-afrilink-dark">Tontines </span>
              <span className="text-afrilink-orange">Digitales</span>
            </h2>

            {/* Description */}
            <p className="mt-5 text-foreground/70 text-base lg:text-lg leading-relaxed max-w-lg">
              Épargnez à plusieurs, atteignez vos objectifs plus vite. Notre plateforme de tontines
              digitales sécurisée et transparente vous permet de bâtir votre avenir ensemble.
            </p>

            {/* Button */}
            <a
              href="#tontines"
              className="mt-8 inline-flex items-center gap-2 bg-afrilink-green text-white font-semibold px-6 py-3 rounded-full hover:bg-afrilink-greenHover transition-all duration-300 hover:scale-105 active:scale-95"
            >
              En savoir plus <ArrowRight className="h-4 w-4" />
            </a>

            {/* 3 stat cards */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              {STATS.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className="bg-white rounded-xl p-4 border border-border hover:shadow-md transition-shadow"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-afrilink-green/10">
                      <Icon className="h-5 w-5 text-afrilink-green" />
                    </span>
                    <p className="mt-3 font-heading font-bold text-sm text-afrilink-dark leading-tight">
                      {s.title}
                    </p>
                    <p className="mt-1 text-[11px] text-foreground/55 leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Highlighted card */}
            <div className="mt-6 bg-afrilink-green/5 border border-afrilink-green/20 rounded-xl p-4 flex items-center gap-4 max-w-lg">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-afrilink-green/10">
                <Users className="h-5 w-5 text-afrilink-green" />
              </span>
              <div className="flex-1">
                <p className="font-heading font-bold text-sm text-afrilink-dark">
                  Tontines hebdomadaires ou mensuelles
                </p>
                <p className="text-xs text-foreground/55">
                  Choisissez le rythme qui vous convient le mieux.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-afrilink-orange shrink-0" />
            </div>
          </div>

          {/* Right: piggy bank image */}
          <div className="relative animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="relative mx-auto max-w-md">
              {/* Green circle background */}
              <div className="absolute inset-4 bg-afrilink-green/10 rounded-full blur-2xl" />
              <div className="absolute top-10 right-10 w-64 h-64 bg-afrilink-green/8 rounded-full" />
              {/* Dotted arc decoration */}
              <svg
                className="absolute -top-6 -right-4 w-32 h-24 overflow-visible"
                viewBox="0 0 120 80"
              >
                <path
                  d="M10 70 Q 60 -10, 110 40"
                  stroke="#D28E2F"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="4 4"
                  className="animate-dash"
                />
              </svg>
              <img
                src={PIGGY_IMG}
                alt="Tirelire digitale avec des pièces et plantes"
                className="relative rounded-3xl w-full animate-float"
              />
            </div>
          </div>
        </div>

        {/* Bottom: 4 feature items */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex items-center gap-3 bg-white rounded-xl p-4 border border-border hover:shadow-md hover:border-afrilink-green/30 transition-all duration-300 cursor-pointer group"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-afrilink-dark group-hover:bg-afrilink-green transition-colors duration-300">
                  <Icon className="h-5 w-5 text-afrilink-orange" />
                </span>
                <div>
                  <p className="font-heading font-bold text-sm text-afrilink-dark group-hover:text-afrilink-green transition-colors duration-300">
                    {f.title}
                  </p>
                  <p className="text-[11px] text-foreground/55">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
