import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  PiggyBank,
  ArrowLeftRight,
  Handshake,
  Store,
  Users,
  Settings,
  UserCog,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { authService } from '@/lib/api/auth.service';
import { authStorage } from '@/lib/auth-storage';

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean };

const navItems: NavItem[] = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { to: '/admin/kyc', label: 'Gestion KYC', icon: ShieldCheck },
  { to: '/admin/tontines', label: 'Tontines', icon: PiggyBank },
  { to: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/admin/marchands', label: 'Marchands', icon: Store },
  { to: '/admin/taux-de-change', label: 'Taux de change', icon: TrendingUp },
  { to: '/admin/partenaires', label: 'Partenaires', icon: Handshake },
];

const adminOnlyItems: NavItem[] = [
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

const superAdminItems: NavItem[] = [
  { to: '/admin/administrateurs', label: 'Gestion des Admins', icon: UserCog },
];

export function AdminSidebar({ role = 'admin' }: { role?: 'admin' | 'super-admin' }) {
  const navigate = useNavigate();
  const items = [...navItems, ...(role === 'super-admin' ? superAdminItems : adminOnlyItems)];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Même si l'appel échoue, on déconnecte côté client
    } finally {
      authStorage.clearAll();
      navigate('/login', { replace: true });
    }
  };

  return (
    <aside className="hidden md:flex sticky top-0 h-screen shrink-0 w-72 max-w-full bg-afrilink-dark text-white flex-col">
      <div className="flex items-center justify-between gap-2 px-6 py-9 md:justify-start">
        <div className="flex items-center gap-2">
          <img
            src="/afrilinkpay_logo1.svg"
            alt="AfrilinkPay"
            className="w-12 h-17 object-contain"
          />
          <span className="font-bold text-md">
            Afrilink<span className="text-afrilink-orange">Pay</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-3 overflow-y-auto pb-6">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white text-afrilink-orange font-medium'
                  : 'text-white hover:bg-white/5'
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
