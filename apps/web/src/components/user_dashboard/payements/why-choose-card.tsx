import { Zap, ShieldCheck } from "lucide-react";

export function WhyChooseCard() {
  return (
    <div className="rounded-2xl bg-afrilink-dark text-white p-5">
      <h3 className="text-sm font-semibold mb-4">Pourquoi choisir AfrilinkPay ?</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Zap className="w-4 h-4 text-afrilink-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">Instantanéité</p>
            <p className="text-[11px] text-white/60">
              Vos services sont activés dès la validation du paiement.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-afrilink-orange mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">Sécurité Totale</p>
            <p className="text-[11px] text-white/60">
              Certifié PCI-DSS pour des transactions sans risque.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
