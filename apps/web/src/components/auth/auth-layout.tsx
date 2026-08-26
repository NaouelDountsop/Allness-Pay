import type { ReactNode } from 'react';
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

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#071418] p-4 sm:p-6">
      <div className="w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-[#0B2026] flex flex-col md:flex-row">
        {/* Panneau gauche */}
        <div className="hidden md:flex md:w-[42%] bg-gradient-to-b from-allness-dark to-allness-darker flex-col p-8 lg:p-10 text-white">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Allness<span className="text-allness-orange">Pay</span>
            </h2>
            <p className="text-sm text-white/70 leading-relaxed mb-8">
              Le futur de la gestion de patrimoine d'entreprise, simplifié pour vous.
            </p>

            <div className="space-y-5">
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

          <div className="flex flex-col items-center gap-6 mt-9 pt-10">
            <img
              src="/allnesspay_logo1.png"
              alt="AllnessPay"
              className="w-70 h-70 object-contain"
            />
            <div className="w-full bg-white/5 border border-white/10 rounded-lg p-4 relative mb-[15px]">
              <p className="text-xs text-white/70 italic leading-relaxed">
                "AllnessPay a transformé notre façon de gérer nos actifs internationaux. Une
                interface d'une fluidité rare."
              </p>
              <div className="w-2 h-2 rounded-full bg-allness-orange absolute -bottom-1 left-4" />
            </div>
          </div>
        </div>

        {/* Panneau droit — formulaire */}
        <div className="flex-1 w-full p-6 sm:p-8 lg:p-10 overflow-y-auto">
          {/* Branding mobile — visible uniquement sur petit écran */}
          <div className="md:hidden flex items-center gap-2 mb-6 bg-allness-dark px-4 py-3 rounded-t-xl">
            <img src="/allnesspay_logo1.png" alt="AllnessPay" className="h-8 w-auto" />
            <span className="text-lg font-bold text-white">
              Allness<span className="text-allness-orange">Pay</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
