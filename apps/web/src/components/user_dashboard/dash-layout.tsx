import type { ReactNode } from 'react';
import { Children } from 'react';
import { Sidebar } from '@/components/user_dashboard/sidebar';
import { BottomNav } from '@/components/user_dashboard/bottom-nav';
import { SidebarProvider, useSidebar } from '@/components/user_dashboard/sidebar-context';

function DashboardLayoutInner({ children }: { children: ReactNode }) {
  const { sidebarOpen, closeSidebar } = useSidebar();
  const childArray = Children.toArray(children);
  const header = childArray[0];
  const content = childArray.slice(1);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gray-50">
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeSidebar}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-full">
            <Sidebar mobile onClose={closeSidebar} />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 pb-20 md:pb-10 flex flex-col">
        {header}
        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-4 flex-1">{content}</div>
      </main>
      <BottomNav />
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </SidebarProvider>
  );
}
