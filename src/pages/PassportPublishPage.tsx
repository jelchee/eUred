import { useParams } from 'react-router-dom';
import { Globe, ShieldCheck } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { useAppStore } from '@/store';
import { DemoDisclaimer } from '@/components/shared';
import { RoleAccessBanner, PassportPublishWorkflow } from '@/components/domain';

/**
 * PassportPublishPage — Page for publishing a battery passport.
 * Wraps PassportPublishWorkflow with heading, asset info summary, and role context.
 *
 * Access restricted to RIMAC_COMPLIANCE_MANAGER and ADMIN roles.
 *
 * @validates FR-DI-011 — Passport publish workflow
 * @validates FR-DI-012 — Public passport generation
 */
export function PassportPublishPage() {
  const { hasPermission } = useRole();
  const { assetId } = useParams<{ assetId: string }>();
  const getAssetById = useAppStore((s) => s.getAssetById);

  const asset = assetId ? getAssetById(assetId) : undefined;

  // Role guard — RIMAC_COMPLIANCE_MANAGER and ADMIN only (they have publish_passport permission)
  if (!hasPermission('publish_passport')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
        <h1 className="text-heading-2 text-text-primary">Access Restricted</h1>
        <p className="text-body text-text-secondary max-w-md text-center">
          Passport publishing is available only to RIMAC Compliance Managers and Administrators.
        </p>
      </div>
    );
  }

  // Asset not found guard
  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Globe className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
        <h1 className="text-heading-2 text-text-primary">Asset Not Found</h1>
        <p className="text-body text-text-secondary max-w-md text-center">
          The requested asset could not be found. Please check the URL and try again.
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
            <Globe className="w-7 h-7 text-accent-cyan" aria-hidden="true" />
            Publish Passport
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Publish the battery passport for public access via QR code.
          </p>
        </div>
        <DemoDisclaimer variant="badge" />
      </header>

      {/* Demo disclaimer banner */}
      <DemoDisclaimer variant="banner" />

      {/* Asset info summary */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4">
        <h2 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">
          Asset Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-text-tertiary text-xs">Model</span>
            <p className="text-text-primary font-medium">{asset.model}</p>
          </div>
          <div>
            <span className="text-text-tertiary text-xs">Serial Number</span>
            <p className="text-text-primary font-medium font-mono">{asset.serialNumber}</p>
          </div>
          <div>
            <span className="text-text-tertiary text-xs">Passport ID</span>
            <p className="text-text-primary font-medium font-mono">{asset.passportId}</p>
          </div>
        </div>
      </div>

      {/* Passport Publish Workflow */}
      <PassportPublishWorkflow assetId={asset.assetId} passportId={asset.passportId} />
    </div>
  );
}
