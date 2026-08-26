import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldCheck, PiggyBank, Store, LogOut } from 'lucide-react';
import { authService } from '@/lib/api/auth.service';
import { authStorage } from '@/lib/auth-storage';
import { ConfirmDialog } from '@/components/common/confirm-dialog';

const tabs = [
  { to: '/admin', label: 'Accueil', icon: LayoutDashboard, end: true },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { to: '/admin/kyc', label: 'KYC', icon: ShieldCheck },
  { to: '/admin/tontines', label: 'Tontines', icon: PiggyBank },
  { to: '/admin/marchands', label: 'Marchands', icon: Store },
];

export function AdminBottomNav() {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Déconnecte quand même côté client
    } finally {
      authStorage.clearAll();
      navigate('/login', { replace: true });
    }
  };

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-[#0D343A] dark:bg-[#061216] rounded-2xl shadow-lg px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="relative">
        <div className="grid grid-cols-6 items-center">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex flex-col items-center justify-center gap-1 text-[11px]"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={isActive ? 'w-5 h-5 text-allness-orange' : 'w-5 h-5 text-white/60'}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                  <span className={isActive ? 'text-allness-orange font-medium' : 'text-white/60'}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => setLogoutOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-[11px]"
          >
            <LogOut className="w-5 h-5 text-white/60" />
            <span className="text-white/60">Quitter</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Se déconnecter"
        description="Voulez-vous vraiment quitter l'interface administrateur ?"
        confirmLabel="Se déconnecter"
        cancelLabel="Rester"
        variant="danger"
        onConfirm={handleLogout}
      />
    </nav>
  );
}
