import { NavLink } from "react-router-dom";
import { Home, Wallet, Send, PiggyBank, CreditCard } from "lucide-react";

const tabs = [
  { to: "/dashboard", label: "Accueil", icon: Home, end: true },
  { to: "/dashboard/wallet", label: "Portefeuille", icon: Wallet },
  { to: "/dashboard/send", label: "Envoyer", icon: Send, center: true },
  { to: "/dashboard/tontines", label: "Tontines", icon: PiggyBank },
  { to: "/dashboard/payments", label: "Paiements", icon: CreditCard },
];

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-afrilink-dark rounded-2xl shadow-lg px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="relative">
        <div className="grid grid-cols-5 items-center">
          {tabs.map(({ to, label, icon: Icon, end, center }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex flex-col items-center justify-center gap-1 text-[11px]"
            >
              {({ isActive }) =>
                center ? (
                  <>
                    <span
                      className={`w-14 h-14 -mt-8 rounded-full flex items-center justify-center border-4 border-afrilink-dark transition-colors ${
                        isActive ? "bg-afrilink-green" : "bg-afrilink-green/80"
                      }`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </span>
                    <span className={isActive ? "text-afrilink-orange font-medium mt-1" : "text-white/50 mt-1"}>
                      {label}
                    </span>
                  </>
                ) : (
                  <>
                    <Icon
                      className={isActive ? "w-5 h-5 text-afrilink-orange" : "w-5 h-5 text-white/60"}
                      strokeWidth={isActive ? 2.4 : 2}
                    />
                    <span className={isActive ? "text-afrilink-orange font-medium" : "text-white/60"}>
                      {label}
                    </span>
                  </>
                )
              }
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
