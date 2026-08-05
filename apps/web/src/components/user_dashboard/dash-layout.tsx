import type { ReactNode } from "react";
import { Sidebar } from "@/components/user_dashboard/sidebar";
import { BottomNav } from "@/components/user_dashboard/bottom-nav";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0 pt-16 md:pt-20 pb-20 md:pb-10">
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
