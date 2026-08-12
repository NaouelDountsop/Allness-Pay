export type BadgeTone = 'green' | 'orange' | 'red' | 'blue' | 'gray' | 'purple' | 'amber';

export type AdminRole = 'admin' | 'super-admin';

export interface NavItem {
  key: string;
  label: string;
  icon: string; // lucide icon name, resolved in AdminSidebar
  href: string;
}
