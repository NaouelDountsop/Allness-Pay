import { Zap, ShieldCheck, Globe } from 'lucide-react';

export function WhyChooseCard() {
  return (
    <div className="rounded-2xl bg-allness-dark text-white p-5">
      <h3 className="text-sm font-semibold mb-4">Pourquoi choisir AfriLinkPay ?</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Zap className="w-4 h-4 text-allness-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">Instantanéité</p>
            <p className="text-[11px] text-white/60">
              Vos paiements sont traités en quelques secondes.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-allness-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">Sécurité Totale</p>
            <p className="text-[11px] text-white/60">
              Protection de vos données et transactions 24h/24.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Globe className="w-4 h-4 text-allness-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">Large Réseau</p>
            <p className="text-[11px] text-white/60">
              Accédez à des centaines de services et partenaires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
