import { NavLink, useNavigate } from "react-router-dom";
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
import { authService } from "@/lib/api/auth.service";
import { authStorage } from "@/lib/auth-storage";

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
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Même si l'appel échoue, on déconnecte côté client
    } finally {
      authStorage.clearAll();
      navigate("/login", { replace: true });
    }
  };

  return (
    // sticky (pas fixed) : la sidebar reste "clouée" à l'écran pendant le scroll,
    // mais reste dans le flux normal du layout. Résultat : aucune page n'a besoin
    // d'un padding/margin compensatoire, contrairement à une sidebar en "fixed".
    // Condition : le composant parent qui affiche <Sidebar /> + le contenu doit
    // être un flex/grid en ligne (ex: <div className="flex">) — c'est déjà
    // presque toujours le cas pour un layout sidebar+contenu classique.
    <aside className="hidden md:flex sticky top-0 h-screen shrink-0 w-72 max-w-full bg-afrilink-dark text-white flex-col">
      <div className="flex items-center gap-3 px-6 py-4">
        <img src="/afrilinkpay_logo1.svg" alt="AfrilinkPay" className="w-14 h-20 object-contain" />
        <span className="font-bold text-lg">
          Afrilink<span className="text-afrilink-orange">Pay</span>
        </span>
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
                  : "text-white hover:bg-white/5"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white bg-[#6B1120] hover:bg-[#7C1526] shadow-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
