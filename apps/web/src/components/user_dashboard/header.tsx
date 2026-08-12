import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, HelpCircle, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { userService } from '@/lib/api/user.service';
import { authService } from '@/lib/api/auth.service';
import { authStorage } from '@/lib/auth-storage';

export function DashboardHeader() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
  });

  const firstName = user?.prenom ?? '';
  const userName = user ? `${firstName} ${user.nom}` : '';
  const memberLabel = user?.profession || 'Membre';

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
      navigate('/login', { replace: true });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 md:left-72 right-0 z-[100] flex items-center justify-between px-3 sm:px-6 lg:px-8 py-3 sm:py-4
      bg-white mb-0 border-b border-gray-100
      rounded-b-[1.5rem] sm:rounded-b-[2rem] shadow-sm"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <h1 className="text-sm sm:text-lg font-semibold text-afrilink-dark flex items-center gap-1.5 truncate">
          Bonjour, {firstName}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          className="text-afrilink-orange hover:text-afrilink-orange/80"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="text-afrilink-orange hover:text-afrilink-orange/80" aria-label="Aide">
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Desktop: profil statique */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-afrilink-dark overflow-hidden flex items-center justify-center text-xs font-medium text-white">
            {userName.charAt(0)}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-afrilink-dark leading-tight">{userName}</p>
            <p className="text-xs text-gray-500 leading-tight">{memberLabel}</p>
          </div>
        </div>

        {/* Mobile: profil avec dropdown */}
        <div className="relative md:hidden" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl p-1 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-afrilink-dark overflow-hidden flex items-center justify-center text-xs font-medium text-white">
              {userName.charAt(0)}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-afrilink-dark">{userName}</p>
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
                    handleLogout();
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
    </header>
  );
}
