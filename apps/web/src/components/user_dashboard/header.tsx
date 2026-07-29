import { Bell, HelpCircle } from "lucide-react";

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
    <header className="flex items-center justify-between px-4 sm:px-8 py-3 bg-afrilink-dark mb-6">
      <div className="flex items-center gap-3">
        <img src="/afrilinkpay_logo1.svg" alt="AfrilinkPay" className="w-9 h-9 object-contain" />
        <h1 className="text-base sm:text-lg font-semibold text-white">Bonjour, {firstName}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-afrilink-orange hover:text-afrilink-orange/90" aria-label="Notifications">
          <Bell className="w-5 h-5 text-afrilink-orange" />
        </button>
        <button className="text-afrilink-orange hover:text-afrilink-orange/90" aria-label="Aide">
          <HelpCircle className="w-5 h-5 text-afrilink-orange" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex items-center justify-center text-xs font-medium text-afrilink-dark">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0)
            )}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white leading-tight">{userName}</p>
            <p className="text-xs text-white/60 leading-tight">{memberLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
