import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAppStore } from '@/store';
import { RoleSwitcher } from './RoleSwitcher';

/** Maps route paths to readable page titles for breadcrumb display */
const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/assets': 'Asset Registry',
  '/compliance': 'Compliance',
  '/documents': 'Document Vault',
  '/tasks': 'Tasks',
  '/audit': 'Audit Trail',
  '/system': 'System Status',
  '/admin/demo-data': 'Demo Data',
};

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  // Derive page title from current route
  const pageTitle =
    routeTitles[location.pathname] ??
    location.pathname
      .split('/')
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' / ');

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-30 flex items-center justify-between px-4 md:px-6 bg-[#0D1321]/80 backdrop-blur-md border-b border-slate-700/50 transition-all duration-300 ${
        sidebarCollapsed ? 'md:left-16' : 'md:left-64'
      } left-0`}
    >
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm md:text-base font-medium text-slate-100 truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right: demo badge + role placeholder + user */}
      <div className="flex items-center gap-3">
        {/* Demo Mode badge — always visible, cannot be dismissed (NFR-002) */}
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30"
          role="status"
          aria-label="Demo Mode — Synthetic Data"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
          Demo Mode
        </span>

        {/* RoleSwitcher */}
        <RoleSwitcher />

        {/* Current user avatar / name */}
        {currentUser && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-semibold text-cyan-400">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <span className="hidden lg:block text-sm text-slate-300 truncate max-w-[120px]">
              {currentUser.name}
            </span>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="p-2 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Logout and return to role selection"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
