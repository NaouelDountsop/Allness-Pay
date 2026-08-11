import type { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { AdminBottomNav } from "./admin-bottom-nav";

export function AdminLayout({
  role = "admin",
  active: _active,
  children,
}: {
  role?: "admin" | "super-admin";
  active?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
