import { Bell, HelpCircle, Menu } from "lucide-react";
import { useContext } from "react";
import { MobileMenuToggleContext } from "@/components/user_dashboard/dash-layout";

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
  const toggleSidebar = useContext(MobileMenuToggleContext);

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-5">
      <div className="flex items-center gap-3">
        {toggleSidebar ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden text-gray-500 hover:text-gray-700"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        ) : null}
        <img src="/afrilinkpay_logo2.svg" alt="AfrilinkPay" className="w-8 h-8 object-contain" />
        <h1 className="text-lg sm:text-xl font-semibold text-afrilink-dark">
          Bonjour, {firstName}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-gray-600" aria-label="Aide">
          <HelpCircle className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-medium text-gray-600">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName.charAt(0)
            )}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-800 leading-tight">{userName}</p>
            <p className="text-xs text-gray-400 leading-tight">{memberLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
