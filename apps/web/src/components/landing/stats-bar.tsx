import { Users, ArrowLeftRight, ShieldCheck, Headset } from 'lucide-react';

const STATS = [
  { icon: Users, value: '500K+', label: 'Utilisateurs actifs' },
  { icon: ArrowLeftRight, value: '2M+', label: 'Transactions réussies' },
  { icon: ShieldCheck, value: '100%', label: 'Sécurisé' },
  { icon: Headset, value: '24/7', label: 'Support client' },
];

export default function StatsBar() {
  return (
    <section className="bg-white dark:bg-[#071418] -mt-px relative z-10">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl shadow-xl overflow-hidden border border-border">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white dark:bg-[#0B2026] flex items-center gap-4 p-5 lg:p-6 hover:bg-muted/50 transition-colors"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-allness-dark">
                  <Icon className="h-6 w-6 text-allness-orange" />
                </span>
                <div>
                  <div className="font-heading font-extrabold text-xl lg:text-2xl text-allness-dark dark:text-white">
                    {s.value}
                  </div>
                  <div className="text-xs lg:text-sm text-foreground/60">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
