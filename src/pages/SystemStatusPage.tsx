import { Server, ShieldCheck } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { DemoDisclaimer } from '@/components/shared';
import { RoleAccessBanner, SystemHealthPanel } from '@/components/domain';

/**
 * SystemStatusPage — Platform system health overview.
 * Shows service statuses (Ingest, API Gateway, Database, Export Queue, Auth),
 * uptime percentages, latency indicators, and trace IDs.
 *
 * Access restricted to ENT_PLATFORM_OPERATOR and ADMIN roles.
 *
 * @validates NFR-005 — Observability: platform health widget, API trace IDs, system status panel
 */
export function SystemStatusPage() {
  const { hasPermission } = useRole();

  // Role guard — only ENT_PLATFORM_OPERATOR and ADMIN
  if (!hasPermission('view_system_status')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
        <h1 className="text-heading-2 text-text-primary">Access Restricted</h1>
        <p className="text-body text-text-secondary max-w-md text-center">
          System status is available only to Platform Operators and Administrators.
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
            <Server className="w-7 h-7 text-accent-cyan" aria-hidden="true" />
            System Status
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Platform health overview — service statuses, uptime, and diagnostics.
          </p>
        </div>
        <DemoDisclaimer variant="badge" />
      </header>

      {/* Demo disclaimer banner */}
      <DemoDisclaimer variant="banner" />

      {/* System Health Panel */}
      <SystemHealthPanel />
    </div>
  );
}
