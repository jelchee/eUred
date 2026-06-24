import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  FileText,
  CheckSquare,
  History,
  Activity,
  Database,
  PlusCircle,
  FileSpreadsheet,
  Plug,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { useRole } from '@/hooks/useRole';
import type { Permission } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  permission?: Permission;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Assets', path: '/assets', icon: Package },
  { label: 'Create Asset', path: '/assets/new', icon: PlusCircle, permission: 'create_assets' },
  { label: 'CSV Import', path: '/import', icon: FileSpreadsheet, permission: 'import_csv' },
  { label: 'Integrations', path: '/integrations', icon: Plug, permission: 'import_mock_api' },
  { label: 'Supplier Portal', path: '/supplier', icon: Package, permission: 'view_supplier_obligations' },
  { label: 'Compliance', path: '/compliance', icon: ShieldCheck },
  { label: 'Documents', path: '/documents', icon: FileText },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Audit Trail', path: '/audit', icon: History },
  { label: 'System Status', path: '/system', icon: Activity },
  { label: 'Demo Data', path: '/admin/demo-data', icon: Database, adminOnly: true },
];

export function Sidebar() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const collapseSidebar = useAppStore((s) => s.collapseSidebar);
  const currentRole = useAppStore((s) => s.currentRole);
  const { hasPermission } = useRole();

  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly && currentRole !== 'ADMIN') return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  return (
    <aside
      className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-[#141B2D] border-r border-slate-700/50 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-4 border-b border-slate-700/50">
        {!sidebarCollapsed && (
          <span className="text-lg font-semibold text-cyan-400 truncate">
            Battery Passport
          </span>
        )}
        {sidebarCollapsed && (
          <span className="text-lg font-semibold text-cyan-400 mx-auto">BP</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {filteredItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 border-l-2 border-transparent'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={collapseSidebar}
          className="flex items-center justify-center w-full p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
