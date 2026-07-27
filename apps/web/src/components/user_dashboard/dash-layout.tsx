import { createContext, ReactNode, useState } from "react";
import { Sidebar } from "@/components/user_dashboard/sidebar";

export const MobileMenuToggleContext = createContext<(() => void) | undefined>(undefined);

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <MobileMenuToggleContext.Provider value={() => setMobileMenuOpen((v) => !v)}>
      <div className="min-h-screen w-full flex bg-gray-50">
        <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </MobileMenuToggleContext.Provider>
  );
}
