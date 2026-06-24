import { useMemo } from 'react';
import { FileText, Download, ShieldCheck } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { AuditTrailTimeline, RoleAccessBanner } from '@/components/domain';
import { DemoDisclaimer } from '@/components/shared';
import { auditEvents } from '@/data/auditEvents';
import { assets } from '@/data/assets';
import { exportAuditCSV } from '@/lib/exportService';

// ============================================================
// AUDIT TRAIL PAGE
// ============================================================

/**
 * AuditTrailPage — Full audit trail with searchable events, filters,
 * and CSV export for admin role.
 *
 * - Read-only for regulator role (no export button)
 * - CSV export button for admin
 * - AuditTrailTimeline with searchable events
 * - Filters: asset, actor, action type, date range
 *
 * @validates FR-010 — Audit Trail
 */
export function AuditTrailPage() {
  const { currentRole } = useRole();

  const isAdmin = currentRole === 'ADMIN';
  const isRegulator = currentRole === 'REGULATOR';

  // Group events by related asset for stats
  const eventsByAsset = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of auditEvents) {
      // Try to extract asset reference from entityId
      const assetMatch = event.entityId.match(/ASSET-SEST-[A-Z]+-\d+/);
      if (assetMatch) {
        const assetId = assetMatch[0];
        map.set(assetId, (map.get(assetId) || 0) + 1);
      }
    }
    return map;
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Role Access Banner */}
      <RoleAccessBanner />

      {/* Demo Mode disclaimer — synthetic audit data (NFR-002) */}
      <DemoDisclaimer variant="banner" />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent-cyan/10">
            <FileText className="w-5 h-5 text-accent-cyan" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-heading-1 text-text-primary">Audit Trail</h1>
            <p className="text-body text-text-secondary">
              {auditEvents.length} events tracked across {assets.length} assets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Regulator read-only indicator */}
          {isRegulator && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span className="text-xs text-text-secondary">Read-only access</span>
            </div>
          )}

          {/* CSV export button — admin only */}
          {isAdmin && (
            <button
              onClick={() => exportAuditCSV(auditEvents)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-colors text-sm font-medium"
              aria-label="Export audit trail as CSV"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Export CSV
            </button>
          )}
        </div>
      </header>

      {/* Asset event summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {assets.map((asset) => {
          const count = eventsByAsset.get(asset.assetId) || 0;
          return (
            <div
              key={asset.assetId}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-text-secondary">{asset.assetId}</span>
                <span className="text-[11px] text-text-tertiary">
                  {asset.location.city}, {asset.location.country}
                </span>
              </div>
              <span className="text-sm font-semibold text-text-primary tabular-nums">
                {count} events
              </span>
            </div>
          );
        })}
      </div>

      {/* Audit Trail Timeline */}
      <section aria-label="Audit trail events">
        <AuditTrailTimeline events={auditEvents} />
      </section>

      {/* Demo disclaimer */}
      <div className="text-center py-4 text-xs text-text-tertiary border-t border-slate-700/50">
        All audit events are synthetic demo data for demonstration purposes only.
      </div>
    </div>
  );
}
