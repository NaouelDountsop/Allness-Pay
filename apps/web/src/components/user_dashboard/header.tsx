import { Bell, HelpCircle, Sparkles } from "lucide-react";

interface HeaderProps {
  firstName: string;
  userName: string;
  memberLabel?: string;
  avatarUrl?: string;
}

export function DashboardHeader({
  firstName,
  userName,
  memberLabel = "Premium Member",
  avatarUrl,
}: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 md:left-72 z-[100] flex items-center justify-between px-3 sm:px-6 lg:px-8 py-3 sm:py-4
      bg-afrilink-dark sm:bg-white border-b border-gray-100
      rounded-b-[1.5rem] sm:rounded-b-[2rem] shadow-sm sm:rounded-none"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <h1 className="text-sm sm:text-lg font-semibold text-white sm:text-afrilink-dark flex items-center gap-1.5 truncate">
          Bonjour, {firstName} <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-afrilink-orange shrink-0" />
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button className="text-afrilink-orange hover:text-afrilink-orange/80" aria-label="Notifications">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="text-afrilink-orange hover:text-afrilink-orange/80" aria-label="Aide">
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 sm:bg-afrilink-dark overflow-hidden flex items-center justify-center text-xs font-medium text-white">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0)
            )}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white sm:text-afrilink-dark leading-tight">{userName}</p>
            <p className="text-xs text-white/60 sm:text-gray-500 leading-tight">{memberLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
