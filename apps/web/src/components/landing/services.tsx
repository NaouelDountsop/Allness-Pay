import { Zap, Droplet, Wifi, Tv, Shield, GraduationCap, PlusCircle } from 'lucide-react';

const SERVICES = [
  { icon: Zap, label: 'Électricité' },
  { icon: Droplet, label: 'Eau' },
  { icon: Wifi, label: 'Internet' },
  { icon: Tv, label: 'Télévision' },
  { icon: Shield, label: 'Assurance' },
  { icon: GraduationCap, label: 'Éducation' },
  { icon: PlusCircle, label: 'Plus encore' },
];

export default function Services() {
  return (
    <section className="bg-white dark:bg-[#071418] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-heading font-extrabold text-[clamp(1.75rem,3.5vw,2.75rem)] text-allness-dark dark:text-white text-balance">
            Payez vos services en quelques clics
          </h2>
          <p className="mt-4 text-foreground/60 text-base lg:text-lg">
            Réglez vos factures essentielles instantanément, en un seul endroit.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-5">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-border hover:border-allness-green hover:bg-muted/50 transition-all cursor-pointer"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-allness-dark group-hover:bg-allness-green transition-colors">
                  <Icon className="h-7 w-7 text-allness-orange" />
                </span>
                <span className="text-xs lg:text-sm font-medium text-allness-dark dark:text-white text-center">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
