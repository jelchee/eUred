import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileText,
  CheckSquare,
  PlusCircle,
  FileSpreadsheet,
  Plug,
  User,
} from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import type { Permission } from '@/types';

interface MobileNavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission?: Permission;
}

const mobileNavItems: MobileNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Assets', path: '/assets', icon: Package },
  { label: 'Documents', path: '/documents', icon: FileText },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Profile', path: '/system', icon: User },
];

const mobileSecondaryItems: MobileNavItem[] = [
  { label: 'Create', path: '/assets/new', icon: PlusCircle, permission: 'create_assets' },
  { label: 'Import', path: '/import', icon: FileSpreadsheet, permission: 'import_csv' },
  { label: 'Integrations', path: '/integrations', icon: Plug, permission: 'import_mock_api' },
  { label: 'Supplier', path: '/supplier', icon: Package, permission: 'view_supplier_obligations' },
];

export function MobileNav() {
  const { hasPermission } = useRole();

  const filteredSecondaryItems = mobileSecondaryItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  // Show up to 5 total items: primary items take priority, fill remaining with secondary
  const maxItems = 5;
  const primaryItems = mobileNavItems.slice(0, maxItems - Math.min(filteredSecondaryItems.length, 1));
  const displayItems: MobileNavItem[] = [
    ...primaryItems,
    ...filteredSecondaryItems.slice(0, maxItems - primaryItems.length),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#141B2D] border-t border-slate-700/50">
      <ul className="flex items-center justify-around h-16">
        {displayItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
