import type { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import { AdminBottomNav } from './admin-bottom-nav';

export function AdminLayout({
  role = 'admin',
  children,
}: {
  active?: string;
  role?: 'admin' | 'super-admin';
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gray-50">
      <AdminSidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden pb-24 md:pb-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
