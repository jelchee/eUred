import { useState } from 'react';
import { Plug, ShieldCheck } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { useAppStore } from '@/store';
import { DemoDisclaimer, DataSourceBadge } from '@/components/shared';
import { MockIntegrationPanel, TelemetrySimulatorControls } from '@/components/domain';

/**
 * MockIntegrationsPage — Page for triggering mock data imports and
 * running the telemetry simulator against a selected asset.
 *
 * Access restricted to RIMAC_OPERATOR, ENT_PLATFORM_OPERATOR, ADMIN.
 *
 * @validates FR-DI-005 — Mock API Integration Panel
 */
export function MockIntegrationsPage() {
  const { hasPermission } = useRole();
  const assets = useAppStore((s) => s.assets);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    assets[0]?.assetId ?? ''
  );

  // Role guard — require import_mock_api or admin-level access
  if (!hasPermission('import_mock_api') && !hasPermission('manage_demo_data')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldCheck className="w-16 h-16 text-text-tertiary" aria-hidden="true" />
        <h1 className="text-heading-2 text-text-primary">Access Restricted</h1>
        <p className="text-body text-text-secondary max-w-md text-center">
          Mock integrations are available only to operators and administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-heading-1 text-text-primary flex items-center gap-2">
            <Plug className="w-7 h-7 text-accent-cyan" aria-hidden="true" />
            Mock Integrations
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Simulate enterprise system imports and telemetry data generation for demo assets.
          </p>
        </div>
        <DemoDisclaimer variant="badge" />
      </header>

      {/* Demo disclaimer banner */}
      <DemoDisclaimer variant="banner" />

      {/* Data source & verification labels */}
      <div className="flex flex-wrap items-center gap-2">
        <DataSourceBadge source="Mock API Import" />
        <DataSourceBadge source="Telemetry Simulator" />
        <span className="text-[11px] text-amber-500/70 italic">
          Synthetic demo data — not externally verified
        </span>
      </div>

      {/* Asset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label
          htmlFor="asset-selector"
          className="text-sm font-medium text-text-secondary whitespace-nowrap"
        >
          Target Asset
        </label>
        <select
          id="asset-selector"
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
          className="w-full sm:w-80 rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/50"
        >
          {assets.map((asset) => (
            <option key={asset.assetId} value={asset.assetId}>
              {asset.serialNumber} — {asset.model}
            </option>
          ))}
        </select>
      </div>

      {/* Mock Integration Panel */}
      <section>
        <MockIntegrationPanel assetId={selectedAssetId} />
      </section>

      {/* Telemetry Simulator */}
      <section className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
        <h3 className="text-heading-3 text-text-primary mb-4">Telemetry Simulator</h3>
        <TelemetrySimulatorControls assetId={selectedAssetId} />
      </section>
    </div>
  );
}
