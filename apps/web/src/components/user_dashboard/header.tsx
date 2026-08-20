import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, HelpCircle, ChevronDown, User, Settings, LogOut, X, BellOff, Menu } from 'lucide-react';
import { userService } from '@/lib/api/user.service';
import { authService } from '@/lib/api/auth.service';
import { authStorage } from '@/lib/auth-storage';
import { getFlagUrl, getCountryCodeByName } from '@/data/countries';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
//import { usePreferences } from '@/hooks/use-preferences';
import { useSidebar } from '@/components/user_dashboard/sidebar-context';

export function DashboardHeader() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  //const { langLabel, toggleLanguage, toggleTheme, theme } = usePreferences();
  const { toggleSidebar } = useSidebar();

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const hasNotifications = notifications.length > 0;
  const firstName = user?.prenom ?? '';
  const userName = user ? `${firstName} ${user.nom}` : '';
  const memberLabel = user?.profession || 'Membre';
  const paysValue = user?.pays ?? '';
  const countryCode = paysValue.length === 2 ? paysValue : getCountryCodeByName(paysValue) ?? '';
  const countryFlag = countryCode ? getFlagUrl(countryCode) : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
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
      navigate('/login', { replace: true });
    }
  };

  return (
    <header
      className="sticky top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4
      bg-white border-b border-gray-100 shadow-sm shrink-0 rounded-b-[1.5rem] sm:rounded-b-[2rem]"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-allness-dark hover:text-allness-orange flex items-center justify-center w-8 h-8"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm sm:text-lg font-semibold text-allness-dark flex items-center gap-2 truncate">
          Bonjour, {firstName}
        </h1>
        {countryFlag && (
          <img
            src={countryFlag}
            alt={user?.pays ?? ''}
            className="w-7 h-5 rounded object-cover border border-gray-200"
          />
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-allness-orange hover:text-allness-orange/80 flex items-center justify-center w-8 h-8"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setNotifOpen(false)} />
              <div className="fixed bottom-0 left-0 right-0 z-50 md:absolute md:right-0 md:top-full md:bottom-auto md:left-auto md:mt-2 w-auto md:w-80 bg-white md:rounded-2xl rounded-t-2xl shadow-lg border border-gray-100 overflow-hidden max-h-[70vh] md:max-h-80">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-allness-dark">Notifications</p>
                  <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(70vh-52px)] md:max-h-[268px]">
                  {hasNotifications ? (
                    notifications.map((n: { id: string; title: string; message: string }) => (
                      <div key={n.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                        <p className="text-sm font-medium text-allness-dark">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <BellOff className="w-10 h-10 text-gray-200 mb-3" />
                      <p className="text-sm font-medium text-gray-500">Aucune notification</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Vous serez notifié des nouvelles activités.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button className="text-allness-orange hover:text-allness-orange/80 flex items-center justify-center w-8 h-8" aria-label="Aide">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Desktop: profil statique */}
        <div className="hidden md:flex items-center gap-2">
          {/* <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            title={langLabel === 'FR' ? 'English' : 'Français'}
          >
            <Globe className="w-3.5 h-3.5" />
            {langLabel}
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button> */}
          <div className="w-8 h-8 rounded-full bg-allness-dark overflow-hidden flex items-center justify-center text-xs font-medium text-white">
            {userName.charAt(0)}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <p className="text-sm font-medium text-allness-dark leading-tight">{userName}</p>
            </div>
            <p className="text-xs text-gray-500 leading-tight">{memberLabel}</p>
          </div>
        </div>

        {/* Mobile: profil avec dropdown */}
        <div className="relative md:hidden" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl p-1 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-allness-dark overflow-hidden flex items-center justify-center text-xs font-medium text-white">
              {userName.charAt(0)}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-allness-dark">{userName}</p>
                  {countryFlag && (
                    <img
                      src={countryFlag}
                      alt={user?.pays ?? ''}
                      className="w-4 h-3 rounded-sm object-cover"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/dashboard/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" />
                Profil
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/dashboard/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Paramètres
              </button>
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
