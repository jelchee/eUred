import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ShieldCheck } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { DemoDisclaimer, DataSourceBadge } from '@/components/shared';
import { RoleAccessBanner, CreateAssetForm } from '@/components/domain';

/**
 * CreateAssetPage — Page for creating a new BESS asset.
 * Wraps CreateAssetForm with heading, DemoDisclaimer, and role context banner.
 *
 * Access restricted to RIMAC_OPERATOR and ADMIN roles.
 *
 * @validates FR-DI-001 — Manual asset creation
 * @validates FR-DI-002 — Draft asset support
 */
export function CreateAssetPage() {
  const { hasPermission } = useRole();
  const navigate = useNavigate();

  // Role guard — RIMAC_OPERATOR and ADMIN only (they have create_assets permission)
  if (!hasPermission('create_assets')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
        <h1 className="text-heading-2 text-text-primary">Access Restricted</h1>
        <p className="text-body text-text-secondary max-w-md text-center">
          Asset creation is available only to RIMAC Operators and Administrators.
        </p>
      </div>
    );
  }

  const handleSuccess = useCallback(
    (assetId: string) => {
      // Navigate to the new asset's detail page after successful creation
      navigate(`/assets/${assetId}`);
    },
    [navigate],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Role Access Banner */}
      <RoleAccessBanner />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-heading-1 text-text-primary flex items-center gap-2">
            <PlusCircle className="w-7 h-7 text-accent-cyan" aria-hidden="true" />
            Create New Asset
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Register a new battery energy storage system (BESS) asset in the platform.
          </p>
        </div>
        <DemoDisclaimer variant="badge" />
      </header>

      {/* Demo disclaimer banner */}
      <DemoDisclaimer variant="banner" />

      {/* Data source & verification labels */}
      <div className="flex flex-wrap items-center gap-2">
        <DataSourceBadge source="Manual Entry" />
        <span className="text-[11px] text-amber-500/70 italic">
          Synthetic demo data — not externally verified
        </span>
      </div>

      {/* Asset creation form */}
      <CreateAssetForm onSuccess={handleSuccess} />
    </div>
  );
}
