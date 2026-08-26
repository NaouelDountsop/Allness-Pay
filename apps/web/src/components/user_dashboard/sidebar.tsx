import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';
import { authService } from '@/lib/api/auth.service';
import { authStorage } from '@/lib/auth-storage';
import { ConfirmDialog } from '@/components/common/confirm-dialog';

export function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/dashboard/send', label: t('sidebar.send'), icon: Send },
    { to: '/dashboard/wallet', label: t('sidebar.wallet'), icon: Wallet },
    { to: '/dashboard/transactions', label: t('sidebar.transactions'), icon: ArrowLeftRight },
    { to: '/dashboard/beneficiaries', label: t('sidebar.beneficiaries'), icon: Users },
    { to: '/dashboard/tontines', label: t('sidebar.tontines'), icon: PiggyBank },
    { to: '/dashboard/payments', label: t('sidebar.payments'), icon: CreditCard },
    { to: '/dashboard/profile', label: t('sidebar.profile'), icon: User },
    { to: '/dashboard/settings', label: t('sidebar.settings'), icon: Settings },
  ];

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
    <aside className={`${mobile ? 'flex h-full' : 'hidden md:flex sticky top-0 h-screen'} shrink-0 w-72 max-w-full bg-[#0D343A] dark:bg-[#061216] text-white flex-col border-r border-white/10 dark:border-white/15`}>
      <div className="flex items-center justify-between gap-2 px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/allnesspay_logo1.png" alt="AllnessPay" className="w-14 h-20 object-contain" />
          <span className="font-bold text-lg">
            Allness<span className="text-brand-orange dark:text-brand-orange">Pay</span>
          </span>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="text-white/70 hover:text-white md:hidden">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
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
                  ? 'bg-white text-allness-orange font-medium'
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
          onClick={() => setLogoutOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white bg-[#6B1120] hover:bg-[#7C1526] shadow-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('sidebar.logout')}
        </button>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title={t('sidebar.logoutTitle')}
        description={t('sidebar.logoutDescription')}
        confirmLabel={t('sidebar.logout')}
        cancelLabel={t('sidebar.logoutCancel')}
        variant="danger"
        onConfirm={handleLogout}
      />
    </aside>
  );
}