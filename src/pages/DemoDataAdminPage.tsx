import { Database, ShieldCheck } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { DemoDisclaimer } from '@/components/shared';
import { RoleAccessBanner, DemoDataControlPanel } from '@/components/domain';

/**
 * DemoDataAdminPage — Admin-only page for managing demo data.
 * Provides reset demo data functionality, telemetry generation,
 * and current dataset statistics display.
 *
 * Access restricted to ADMIN role only.
 *
 * @validates FR-014 — Demo Data Seeder: one-click reset, generate telemetry, dataset stats
 */
export function DemoDataAdminPage() {
  const { hasPermission } = useRole();

  // Role guard — ADMIN only
  if (!hasPermission('manage_demo_data')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
        <h1 className="text-heading-2 text-text-primary">Access Restricted</h1>
        <p className="text-body text-text-secondary max-w-md text-center">
          Demo data management is available only to Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Role Access Banner */}
      <RoleAccessBanner />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-heading-1 text-text-primary flex items-center gap-2">
            <Database className="w-7 h-7 text-accent-cyan" aria-hidden="true" />
            Demo Data Administration
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Manage the synthetic demo dataset — reset, regenerate, and review statistics.
          </p>
        </div>
        <DemoDisclaimer variant="badge" />
      </header>

      {/* Demo disclaimer banner */}
      <DemoDisclaimer variant="banner" />

      {/* Demo Data Control Panel */}
      <DemoDataControlPanel />
    </div>
  );
}
