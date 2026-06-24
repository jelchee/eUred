import { Package, ShieldCheck } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { DemoDisclaimer, DataSourceBadge } from '@/components/shared';
import { RoleAccessBanner, SupplierPortalView } from '@/components/domain';

/**
 * SupplierPortalPage — Supplier-only page for viewing obligations and submitting declarations.
 * Displays obligation summary statistics and the full SupplierPortalView component.
 *
 * Access restricted to SUPPLIER_USER role only.
 *
 * @validates FR-DI-007 — Supplier Data-Ingestion Portal
 */
export function SupplierPortalPage() {
  const { hasPermission, currentUser } = useRole();

  // Role guard — SUPPLIER_USER only
  if (!hasPermission('view_supplier_obligations')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
        <h1 className="text-heading-2 text-text-primary">Access Restricted</h1>
        <p className="text-body text-text-secondary max-w-md text-center">
          The Supplier Portal is available only to Supplier Users.
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
            <Package className="w-7 h-7 text-accent-cyan" aria-hidden="true" />
            Supplier Portal
          </h1>
          <p className="text-body text-text-secondary mt-1">
            View your data obligations and submit declarations for battery passport compliance.
          </p>
        </div>
        <DemoDisclaimer variant="badge" />
      </header>

      {/* Demo disclaimer banner */}
      <DemoDisclaimer variant="banner" />

      {/* Data source & verification labels */}
      <div className="flex flex-wrap items-center gap-2">
        <DataSourceBadge source="Supplier Submission" />
        <span className="text-[11px] text-amber-500/70 italic">
          Synthetic demo data — not externally verified
        </span>
      </div>

      {/* Supplier Portal View */}
      <SupplierPortalView supplierId={currentUser?.organizationId ?? ''} />
    </div>
  );
}
