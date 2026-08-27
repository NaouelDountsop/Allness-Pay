import { useState } from 'react';
import type { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import { AdminBottomNav } from './admin-bottom-nav';

export function AdminLayout({
  role = 'admin',
  active: _active,
  children,
}: {
  role?: 'admin' | 'super-admin';
  active?: string;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFB] dark:bg-[#071418]">
      {/* Desktop sidebar */}
      <AdminSidebar role={role} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-full">
            <AdminSidebar role={role} mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminTopbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 min-w-0 pb-20 md:pb-6">
          <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-4 flex-1">{children}</div>
        </main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
