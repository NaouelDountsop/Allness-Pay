import { useState, useEffect, type ReactNode } from 'react';
import { ShieldCheck, Zap } from 'lucide-react';

interface Feature {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: 'Sécurité de Niveau Bancaire',
    description: 'Vos données sont protégées par le plus haut standard de cryptage.',
  },
  {
    icon: Zap,
    title: 'Transactions Instantanées',
    description: 'Gérez vos fonds en temps réel, sans friction.',
  },
];

const SLIDES = [
  { src: '/talent.png', alt: 'Talent' },
  { src: 'https://media.base44.com/images/public/6a79f10b5afc47c1eeaa932f/5b0727994_generated_image.png', alt: 'AllnessPay' },
];

const PAUSE_DURATION = 3000;
const SCROLL_DURATION = 1000;

export function LoginLayout({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const pauseTimer = setTimeout(() => {
      setIsScrolling(true);
      const scrollTimer = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % SLIDES.length);
        setIsScrolling(false);
      }, SCROLL_DURATION);
      return () => clearTimeout(scrollTimer);
    }, PAUSE_DURATION);
    return () => clearTimeout(pauseTimer);
  }, [current, isScrolling]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#071418] p-4 sm:p-6">
      <div className="w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-[#0B2026] flex flex-col md:flex-row">
        {/* Panneau gauche */}
        <div className="hidden md:flex md:w-[42%] bg-gradient-to-b from-allness-dark to-allness-darker flex-col p-8 lg:p-10 text-white">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Allness <span className="text-allness-orange">Pay</span>
            </h2>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Le futur de la gestion de patrimoine d'entreprise, simplifié pour vous.
            </p>

            <div className="space-y-4 mb-6">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-allness-orange/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-allness-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-white/60">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carrousel */}
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10">
            <div
              className="flex h-full"
              style={{
                transform: `translateX(-${current * 100}%)`,
                transition: isScrolling ? `transform ${SCROLL_DURATION}ms ease-in-out` : 'none',
              }}
            >
              {SLIDES.map((slide) => (
                <div key={slide.src} className="min-w-full h-full shrink-0">
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'bg-allness-orange w-5' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Panneau droit — formulaire */}
        <div className="flex-1 w-full p-6 sm:p-8 lg:p-10 overflow-y-auto">
          {/* Branding mobile */}
          <div className="md:hidden flex items-center gap-2 mb-6 bg-allness-dark px-4 py-3 rounded-t-xl">
            <img src="/allnesspay_logo1.png" alt="AllnessPay" className="h-8 w-auto" />
            <span className="text-lg font-bold text-white">
              Allness <span className="text-allness-orange">Pay</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
