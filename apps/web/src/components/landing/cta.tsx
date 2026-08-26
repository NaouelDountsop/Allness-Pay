import { Plane } from 'lucide-react';

export default function CTA() {
  return (
    <section className="bg-allness-dark text-white py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-20">
        <Plane className="h-48 w-48 text-allness-orange -rotate-12" strokeWidth={1} />
      </div>
      <div className="relative mx-auto max-w-5xl px-5 lg:px-8 text-center">
        <h2 className="font-heading font-extrabold text-[clamp(1.75rem,4vw,3rem)] text-balance">
          Prêt à transformer votre avenir financier ?
        </h2>
        <p className="mt-5 text-white/75 text-base lg:text-lg max-w-2xl mx-auto">
          Rejoignez Allness Pay aujourd'hui et commencez à gérer votre argent avec plus de liberté
          et d'efficacité.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/signup"
            className="bg-allness-green text-white font-semibold px-7 py-3.5 rounded-full hover:bg-allness-green/90 transition-all duration-300 shadow-lg shadow-allness-green/25 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Créer un compte
          </a>
          <a
            href="#fonctionnalites"
            className="bg-white dark:bg-[#0B2026] text-allness-dark dark:text-white font-semibold px-7 py-3.5 rounded-full hover:bg-allness-orange hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
          >
            En savoir plus
          </a>
        </div>
      </div>
    </section>
  );
}
