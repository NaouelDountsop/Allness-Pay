import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Wallet,
  ArrowLeftRight,
  Users,
  PiggyBank,
  CreditCard,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/dashboard/send", label: "Envoyer", icon: Send },
  { to: "/dashboard/wallet", label: "Portefeuille", icon: Wallet },
  { to: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/dashboard/beneficiaries", label: "Bénéficiaires", icon: Users },
  { to: "/dashboard/tontines", label: "Tontines", icon: PiggyBank },
  { to: "/dashboard/payments", label: "Paiements", icon: CreditCard },
  { to: "/dashboard/profile", label: "Profil", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
      <aside className="hidden md:flex inset-y-0 left-0 z-50 w-72 max-w-full bg-afrilink-dark text-white flex-col">
        <div className="flex items-center justify-between gap-2 px-6 py-9 md:justify-start">
          <div className="flex items-center gap-2">
            <img src="/afrilinkpay_logo1.svg" alt="AfrilinkPay" className="w-12 h-17 object-contain" />
            <span className="font-bold text-md">
              Afrilink<span className="text-afrilink-orange">Pay</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-3 overflow-y-auto pb-6">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white text-afrilink-orange font-medium"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
