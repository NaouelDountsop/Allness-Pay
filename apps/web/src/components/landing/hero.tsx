import { Check, Lock, Send, Wallet, Plane } from 'lucide-react';

const HERO_IMG =
  'https://media.base44.com/images/public/6a79f10b5afc47c1eeaa932f/5b0727994_generated_image.png';

export default function Hero() {
  return (
    <section
      id="accueil"
      className="relative text-white overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0f2e33 0%, #14382e 40%, #0f2e33 100%)' }}
    >
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-allness-green/20 blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-allness-orange/8 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-28 lg:pt-36 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          <div className="animate-fade-up">
            <h1 className="font-heading font-extrabold text-[clamp(2.1rem,5.5vw,4rem)] leading-[1.08] text-balance">
              Gérez votre patrimoine global{' '}
              <span className="text-allness-orange">en toute simplicité.</span>
            </h1>
            <p className="mt-6 text-base lg:text-lg text-white/75 max-w-xl leading-relaxed">
              Envoyez de l'argent, payez vos services et gérez vos tontines en toute sécurité,
              partout dans le monde avec Allness Pay.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/signup"
                className="bg-allness-green text-white font-semibold px-7 py-3.5 rounded-full hover:bg-allness-green/90 transition-all duration-300 shadow-lg shadow-allness-green/25 hover:shadow-xl hover:shadow-allness-green/35 hover:scale-105 active:scale-95"
              >
                Créer un compte
              </a>
              <a
                href="#fonctionnalites"
                className="border-2 border-allness-orange text-white font-semibold px-7 py-3.5 rounded-full hover:bg-allness-orange hover:text-allness-dark transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Découvrir
              </a>
            </div>

            <div className="mt-7 flex items-center gap-2 text-sm text-white/80">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-allness-green animate-pulse-glow">
                <Check className="h-3.5 w-3.5 text-white" />
              </span>
              Sécurisé, rapide et fiable
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="relative mx-auto max-w-md">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={HERO_IMG}
                  alt="Homme en veste jaune regardant son téléphone"
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-2 -left-4 lg:-left-10 w-56 bg-white text-allness-dark rounded-2xl shadow-2xl p-4 animate-float-slow">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-foreground/50 font-medium">Solde</span>
                  <Wallet className="h-4 w-4 text-allness-green" />
                </div>
                <div className="font-heading font-extrabold text-2xl mt-1">42 850,00 CFA</div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-2">
                    <Send className="h-4 w-4 text-allness-green" />
                    <span className="text-xs font-medium">Transfert d'argent</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-2">
                    <Wallet className="h-4 w-4 text-allness-green" />
                    <span className="text-xs font-medium">Paiement de services</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-6 -right-2 lg:-right-6 flex items-center animate-arc-wobble">
                <svg width="80" height="45" className="overflow-visible">
                  <path
                    d="M0 35 Q 40 -5, 75 12"
                    stroke="#D28E2F"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray="6 5"
                    className="animate-dash"
                  />
                </svg>
                <span
                  className="bg-allness-orange rounded-full p-2.5 ml-1 shadow-lg animate-float"
                  style={{ animationDelay: '0.9s' }}
                >
                  <Plane className="h-5 w-5 text-white" />
                </span>
              </div>

              <div
                className="absolute top-4 -left-4 lg:-left-8 bg-white text-allness-dark rounded-xl shadow-xl px-3 py-2 flex items-center gap-2 animate-float"
                style={{ animationDelay: '1s' }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-allness-dark">
                  <Lock className="h-4 w-4 text-allness-orange" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold leading-tight">
                    Transactions sécurisées
                  </div>
                  <div className="text-[10px] text-foreground/55 leading-tight">
                    Chiffrement de bout en bout
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
