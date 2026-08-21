import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, ChevronDown, LogOut, Menu, Globe, Moon, Sun } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/api/auth.service';
import { authStorage } from '@/lib/auth-storage';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { usePreferences } from '@/hooks/use-preferences';

interface AdminProfile {
  idutilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  profession: string;
  statut: string;
  role?: string;
}

async function fetchAdminProfile(): Promise<AdminProfile> {
  const res = await apiClient.get<AdminProfile>('/auth/profile');
  return res.data;
}

export function AdminTopbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { langLabel, toggleLanguage, toggleTheme, theme } = usePreferences();

  const { data: admin } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: fetchAdminProfile,
    staleTime: 5 * 60 * 1000,
  });

  const displayName = admin
    ? `${admin.prenom || ''} ${admin.nom || ''}`.trim() || 'Admin'
    : 'Admin';
  const firstName = admin?.prenom ?? 'Admin';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Déconnecte quand même côté client
    } finally {
      authStorage.clearAll();
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <header
      className="sticky top-0 left-0 md:left-72 right-0 z-30 flex items-center justify-between px-3 sm:px-6 lg:px-8 py-3 sm:py-4
      bg-white border-b border-gray-100 shadow-sm shrink-0 rounded-b-[1.5rem] sm:rounded-b-[2rem]"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-allness-dark hover:text-allness-orange flex items-center justify-center w-8 h-8"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm sm:text-lg font-semibold text-allness-dark flex items-center gap-2 truncate">
          Bonjour, {firstName}
        </h1>
        {admin?.role && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-allness-dark/10 px-2 py-0.5 text-[10px] font-semibold text-allness-dark">
            {admin.role === 'super-admin' ? 'Super Admin' : 'Admin'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {/* Notification bell */}
        <div className="relative">
          <button
            className="relative text-allness-orange hover:text-allness-orange/80 flex items-center justify-center w-8 h-8"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>

      

        {/* Desktop: profil statique */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-allness-orange hover:bg-gray-100 transition-colors"
            title={langLabel === 'FR' ? 'English' : 'Français'}
          >
            <Globe className="w-5 h-5" />
            {langLabel}
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-allness-orange hover:bg-gray-100 transition-colors"
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-4 h-4" />}
          </button>
            <button className="text-allness-orange hover:text-allness-orange/80 flex items-center justify-center w-8 h-8" aria-label="Aide">
          <HelpCircle className="w-5 h-5" />
        </button>
          <div className="w-8 h-8 rounded-full bg-allness-dark overflow-hidden flex items-center justify-center text-xs font-medium text-white">
            {initials}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <p className="text-sm font-medium text-allness-dark leading-tight">{displayName}</p>
            </div>
            <p className="text-xs text-gray-500 leading-tight">{admin?.profession || 'Administrateur'}</p>
          </div>
        </div>

        {/* Mobile: profil avec dropdown */}
        <div className="relative md:hidden" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl p-1 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-allness-dark overflow-hidden flex items-center justify-center text-xs font-medium text-white">
              {initials}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-allness-dark">{displayName}</p>
                <p className="text-xs text-gray-500">{admin?.email}</p>
              </div>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Se déconnecter"
        description="Voulez-vous vraiment vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte."
        confirmLabel="Se déconnecter"
        cancelLabel="Rester"
        variant="danger"
        onConfirm={handleLogout}
      />
    </header>
  );
}
