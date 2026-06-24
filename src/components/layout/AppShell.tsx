import { useAppStore } from '@/store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Root layout shell for all authenticated pages.
 * Provides sidebar navigation, top bar, and mobile bottom nav.
 * Includes persistent "Demo Mode" visual indicator (NFR-002).
 */
export function AppShell({ children }: AppShellProps) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#070B16]">
      {/* Persistent Demo Mode top indicator — cannot be dismissed (NFR-002) */}
      <div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/80 via-amber-400 to-amber-500/80 z-50"
        role="status"
        aria-label="Demo Mode active"
      />

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Top bar */}
      <TopBar />

      {/* Main content area */}
      <main
        className={`pt-16 pb-16 md:pb-0 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
