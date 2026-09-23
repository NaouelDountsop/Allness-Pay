import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bell, HelpCircle, ChevronDown, User, Settings, LogOut, X, BellOff, Menu, Globe, Moon, Sun } from 'lucide-react';
import { userService } from '@/lib/api/user.service';
import { authService } from '@/lib/api/auth.service';
import { authStorage } from '@/lib/auth-storage';
import { getFlagUrl, getCountryCodeByName } from '@/data/countries';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { usePreferences } from '@/hooks/use-preferences';
import { useSidebar } from '@/components/user_dashboard/sidebar-context';
import { HelpCenterPanel } from '@/components/user_dashboard/help-center-panel';
import { supportService } from '@/lib/api/support.service';

export function DashboardHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [unreadSupport, setUnreadSupport] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { langLabel, toggleLanguage, toggleTheme, theme } = usePreferences();
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
  });

  const hasNotifications = notifications.length > 0;
  const firstName = user?.prenom ?? '';
  const userName = user ? `${firstName} ${user.nom}` : '';
  const memberLabel = user?.profession || t('header.member');
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

  // Poll unread support messages every 5s
  useEffect(() => {
    if (helpOpen) return;
    const fetchUnread = async () => {
      try {
        const { totalUnread } = await supportService.getUnreadCount();
        setUnreadSupport(totalUnread);
      } catch {
        // silent
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [helpOpen]);

  const handleOpenHelp = useCallback(() => {
    setUnreadSupport(0);
    setHelpOpen(true);
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
      bg-white dark:bg-[#08191E] border-b border-gray-100 dark:border-[#18353B] shadow-sm shrink-0 rounded-b-[1.5rem] sm:rounded-b-[2rem]"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-[#082B37] dark:text-[#F1F5F5] hover:text-[#D28E2F] flex items-center justify-center w-8 h-8"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm sm:text-lg font-semibold text-[#082B37] dark:text-[#F1F5F5] flex items-center gap-2 truncate">
          {t('header.greeting')}, {firstName}
        </h1>
        {countryFlag && (
          <img
            src={countryFlag}
            alt={user?.pays ?? ''}
            className="w-7 h-5 rounded object-cover border border-brand-border dark:border-brand-border"
          />
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-brand-orange hover:text-brand-orange/80 flex items-center justify-center w-8 h-8"
            aria-label={t('header.notifications')}
          >
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-brand-red rounded-full border-2 border-brand-header dark:border-brand-header" />
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setNotifOpen(false)} />
              <div className="fixed bottom-0 left-0 right-0 z-50 md:absolute md:right-0 md:top-full md:bottom-auto md:left-auto md:mt-2 w-auto md:w-80 bg-brand-header dark:bg-brand-header md:rounded-2xl rounded-t-2xl shadow-lg border border-brand-border dark:border-brand-border overflow-hidden max-h-[70vh] md:max-h-80">
                <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border dark:border-brand-border">
                  <p className="text-sm font-semibold text-brand-text dark:text-brand-text">{t('header.notifications')}</p>
                  <button onClick={() => setNotifOpen(false)} className="text-brand-text-secondary dark:text-brand-text-secondary hover:text-brand-text dark:hover:text-brand-text">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(70vh-52px)] md:max-h-[268px]">
                  {hasNotifications ? (
                    notifications.map((n: { id: string; title: string; message: string }) => (
                      <div key={n.id} className="px-4 py-3 border-b border-brand-border/50 dark:border-brand-border/50 last:border-0">
                        <p className="text-sm font-medium text-brand-text dark:text-brand-text">{n.title}</p>
                        <p className="text-xs text-brand-text-secondary dark:text-brand-text-secondary mt-0.5">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <BellOff className="w-10 h-10 text-brand-text-disabled dark:text-brand-text-disabled mb-3" />
                      <p className="text-sm font-medium text-brand-text-secondary dark:text-brand-text-secondary">{t('header.noNotifications')}</p>
                      <p className="text-xs text-brand-text-disabled dark:text-brand-text-disabled mt-1">
                        {t('header.noNotificationsHint')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        

        {/* Desktop: profil statique */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-brand-orange hover:bg-brand-hover dark:hover:bg-brand-hover transition-colors"
            title={langLabel === 'FR' ? 'English' : 'Français'}
          >
            <Globe className="w-5 h-5" />
            {langLabel}
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-brand-orange hover:bg-brand-hover dark:hover:bg-brand-hover transition-colors"
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={handleOpenHelp}
            className="text-brand-orange hover:text-brand-orange/80 flex items-center justify-center w-8 h-8 relative"
            aria-label={t('header.help')}
          >
            <HelpCircle className="w-5 h-5" />
            {unreadSupport > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadSupport > 99 ? '99+' : unreadSupport}
              </span>
            )}
          </button>
          <div className="w-8 h-8 rounded-full bg-brand-sidebar dark:bg-brand-sidebar overflow-hidden flex items-center justify-center text-xs font-medium text-white">
            {userName.charAt(0)}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <p className="text-sm font-medium text-brand-text dark:text-brand-text leading-tight">{userName}</p>
            </div>
            <p className="text-xs text-brand-text-secondary dark:text-brand-text-secondary leading-tight">{memberLabel}</p>
          </div>
        </div>

        {/* Mobile: profil avec dropdown */}
        <div className="relative md:hidden" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-brand-hover dark:hover:bg-brand-hover rounded-xl p-1 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-sidebar dark:bg-brand-sidebar overflow-hidden flex items-center justify-center text-xs font-medium text-white">
              {userName.charAt(0)}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-brand-text-secondary dark:text-brand-text-secondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-brand-header dark:bg-brand-header rounded-2xl shadow-lg border border-brand-border dark:border-brand-border py-2 z-50">
              <div className="px-4 py-3 border-b border-brand-border dark:border-brand-border">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-brand-text dark:text-brand-text">{userName}</p>
                  {countryFlag && (
                    <img
                      src={countryFlag}
                      alt={user?.pays ?? ''}
                      className="w-4 h-3 rounded-sm object-cover"
                    />
                  )}
                </div>
                <p className="text-xs text-brand-text-secondary dark:text-brand-text-secondary">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/dashboard/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-text dark:text-brand-text hover:bg-brand-hover dark:hover:bg-brand-hover transition-colors"
              >
                <User className="w-4 h-4 text-brand-text-secondary dark:text-brand-text-secondary" />
                {t('header.profile')}
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/dashboard/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-text dark:text-brand-text hover:bg-brand-hover dark:hover:bg-brand-hover transition-colors"
              >
                <Settings className="w-4 h-4 text-brand-text-secondary dark:text-brand-text-secondary" />
                {t('header.settings')}
              </button>
              <div className="border-t border-brand-border dark:border-brand-border mt-1 pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-red hover:bg-brand-bg-red-light dark:hover:bg-brand-bg-red-light transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('header.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title={t('header.logoutTitle')}
        description={t('header.logoutDescription')}
        confirmLabel={t('header.logoutConfirm')}
        cancelLabel={t('header.logoutCancel')}
        variant="danger"
        onConfirm={handleLogout}
      />

      <HelpCenterPanel isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  );
}
