import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Battery,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  ListChecks,
  Clock,
} from 'lucide-react';
import { KPICard } from '@/components/shared';
import { AssetStatusCard, RoleAccessBanner } from '@/components/domain';
import { useAssets } from '@/hooks/useAssets';
import { useRole } from '@/hooks/useRole';
import { DemoDisclaimer } from '@/components/shared';
import { tasks } from '@/data/tasks';
import { auditEvents } from '@/data/auditEvents';
import type { UserRole, Task, AuditEvent } from '@/types';

// ============================================================
// ROLE VISIBILITY CONFIG
// ============================================================

/** KPI keys visible per role — PUBLIC_VIEWER sees minimal, ADMIN sees all */
const ROLE_KPI_VISIBILITY: Record<UserRole, string[]> = {
  PUBLIC_VIEWER: ['totalAssets'],
  ASSET_OWNER: ['totalAssets', 'avgSoH', 'passportReadiness', 'criticalGaps'],
  RIMAC_SERVICE_ENGINEER: ['totalAssets', 'avgSoH', 'passportReadiness', 'criticalGaps'],
  ENT_PLATFORM_OPERATOR: ['totalAssets', 'avgSoH', 'passportReadiness', 'criticalGaps'],
  REGULATOR: ['totalAssets', 'passportReadiness', 'criticalGaps'],
  RECYCLER: ['totalAssets', 'passportReadiness'],
  ADMIN: ['totalAssets', 'avgSoH', 'passportReadiness', 'criticalGaps'],
  RIMAC_OPERATOR: ['totalAssets', 'avgSoH', 'passportReadiness', 'criticalGaps'],
  RIMAC_COMPLIANCE_MANAGER: ['totalAssets', 'avgSoH', 'passportReadiness', 'criticalGaps'],
  RIMAC_SERVICE_USER: ['totalAssets', 'avgSoH', 'passportReadiness'],
  SUPPLIER_USER: ['totalAssets'],
};

const ROLE_SECTION_VISIBILITY: Record<UserRole, string[]> = {
  PUBLIC_VIEWER: ['assets'],
  ASSET_OWNER: ['assets', 'tasks', 'recentAudit'],
  RIMAC_SERVICE_ENGINEER: ['assets', 'tasks', 'recentAudit'],
  ENT_PLATFORM_OPERATOR: ['assets', 'tasks', 'recentAudit'],
  REGULATOR: ['assets', 'recentAudit'],
  RECYCLER: ['assets'],
  ADMIN: ['assets', 'tasks', 'recentAudit'],
  RIMAC_OPERATOR: ['assets', 'tasks', 'recentAudit'],
  RIMAC_COMPLIANCE_MANAGER: ['assets', 'tasks', 'recentAudit'],
  RIMAC_SERVICE_USER: ['assets', 'tasks'],
  SUPPLIER_USER: ['assets'],
};

// ============================================================
// HELPERS
// ============================================================

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ACTION_LABELS: Record<string, string> = {
  ATTRIBUTE_CREATED: 'Attribute Created',
  ATTRIBUTE_UPDATED: 'Attribute Updated',
  ATTRIBUTE_STATUS_CHANGED: 'Status Changed',
  ATTRIBUTE_VERIFIED: 'Attribute Verified',
  DOCUMENT_UPLOADED: 'Document Uploaded',
  DOCUMENT_VERIFIED: 'Document Verified',
  DOCUMENT_EXPIRED: 'Document Expired',
  ROLE_ACCESS_GRANTED: 'Access Granted',
  TELEMETRY_INGESTED: 'Telemetry Ingested',
  TASK_CREATED: 'Task Created',
  TASK_RESOLVED: 'Task Resolved',
  PASSPORT_CREATED: 'Passport Created',
  EXPORT_GENERATED: 'Export Generated',
};

const ACTION_DOT_COLORS: Record<string, string> = {
  ATTRIBUTE_CREATED: 'bg-cyan-500',
  ATTRIBUTE_UPDATED: 'bg-blue-500',
  ATTRIBUTE_STATUS_CHANGED: 'bg-amber-500',
  ATTRIBUTE_VERIFIED: 'bg-emerald-500',
  DOCUMENT_UPLOADED: 'bg-cyan-500',
  DOCUMENT_VERIFIED: 'bg-emerald-500',
  DOCUMENT_EXPIRED: 'bg-red-500',
  ROLE_ACCESS_GRANTED: 'bg-purple-500',
  TELEMETRY_INGESTED: 'bg-blue-400',
  TASK_CREATED: 'bg-amber-500',
  TASK_RESOLVED: 'bg-emerald-500',
  PASSPORT_CREATED: 'bg-cyan-400',
  EXPORT_GENERATED: 'bg-slate-400',
};

// ============================================================
// DASHBOARD PAGE
// ============================================================

/**
 * DashboardPage — Main authenticated dashboard with KPI hero row,
 * asset cards grid, task summary, and recent audit events.
 *
 * Content is role-filtered: PUBLIC_VIEWER sees minimal data,
 * ADMIN sees everything.
 *
 * @validates FR-001 — Asset Registry (overview)
 * @validates FR-004 — Compliance Gap Analyzer (top gaps display)
 * @validates FR-012 — Notifications & Tasks (task count by priority)
 */
export function DashboardPage() {
  const { assets } = useAssets();
  const { currentRole } = useRole();
  const navigate = useNavigate();

  const visibleKPIs = ROLE_KPI_VISIBILITY[currentRole];
  const visibleSections = ROLE_SECTION_VISIBILITY[currentRole];

  // Compute KPIs
  const kpis = useMemo(() => {
    const totalAssets = assets.length;

    const assetsWithSoH = assets.filter((a) => a.latestTelemetry?.sohPct != null);
    const avgSoH =
      assetsWithSoH.length > 0
        ? assetsWithSoH.reduce((sum, a) => sum + (a.latestTelemetry?.sohPct ?? 0), 0) /
          assetsWithSoH.length
        : 0;

    const avgComplianceScore =
      assets.length > 0
        ? assets.reduce((sum, a) => sum + a.complianceScorePct, 0) / assets.length
        : 0;

    const criticalGaps = assets.filter(
      (a) => a.complianceStatus === 'critical_gaps'
    ).length;

    return { totalAssets, avgSoH, avgComplianceScore, criticalGaps };
  }, [assets]);

  // Task counts by priority
  const taskCounts = useMemo(() => {
    const openTasks = tasks.filter((t: Task) => t.status !== 'resolved' && t.status !== 'dismissed');
    return {
      critical: openTasks.filter((t) => t.priority === 'critical').length,
      high: openTasks.filter((t) => t.priority === 'high').length,
      medium: openTasks.filter((t) => t.priority === 'medium').length,
      low: openTasks.filter((t) => t.priority === 'low').length,
      total: openTasks.length,
    };
  }, []);

  // Recent 5 audit events sorted by timestamp descending
  const recentEvents = useMemo(() => {
    return [...auditEvents]
      .sort((a: AuditEvent, b: AuditEvent) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, []);

  const handleAssetClick = (assetId: string) => {
    navigate(`/assets/${assetId}`);
  };

  return (
    <div className="space-y-6">
      {/* Role Access Banner */}
      <RoleAccessBanner />

      {/* Demo Mode disclaimer — synthetic data notice (NFR-002) */}
      <DemoDisclaimer variant="banner" />

      {/* Page title */}
      <div>
        <h1 className="text-heading-1 text-text-primary">Dashboard</h1>
        <p className="text-body text-text-secondary mt-1">
          Battery passport platform overview
        </p>
      </div>

      {/* KPI Hero Row */}
      <section aria-label="Key performance indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleKPIs.includes('totalAssets') && (
            <KPICard
              label="Total Assets"
              value={kpis.totalAssets}
              icon={Battery}
              variant="glass"
              accentColor="cyan"
            />
          )}
          {visibleKPIs.includes('avgSoH') && (
            <KPICard
              label="Average SoH"
              value={`${kpis.avgSoH.toFixed(1)}`}
              unit="%"
              icon={HeartPulse}
              variant="glass"
              accentColor="emerald"
              trend={{ direction: 'stable', value: '±0.0%' }}
            />
          )}
          {visibleKPIs.includes('passportReadiness') && (
            <KPICard
              label="Passport Readiness"
              value={`${kpis.avgComplianceScore.toFixed(0)}`}
              unit="%"
              icon={ShieldCheck}
              variant="glass"
              accentColor="amber"
            />
          )}
          {visibleKPIs.includes('criticalGaps') && (
            <KPICard
              label="Critical Gaps"
              value={kpis.criticalGaps}
              icon={AlertTriangle}
              variant="glass"
              accentColor={kpis.criticalGaps > 0 ? 'red' : 'emerald'}
            />
          )}
        </div>
      </section>

      {/* Asset Cards Grid */}
      {visibleSections.includes('assets') && (
        <section aria-label="Asset overview">
          <h2 className="text-heading-2 text-text-primary mb-4">Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <AssetStatusCard
                key={asset.assetId}
                asset={asset}
                variant="expanded"
                onClick={handleAssetClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Tasks Summary + Recent Audit Events row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Summary */}
        {visibleSections.includes('tasks') && (
          <section aria-label="Task summary" className="card p-card-padding">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              <h2 className="text-heading-3 text-text-primary">Open Tasks</h2>
              <span className="ml-auto text-caption text-text-tertiary">
                {taskCounts.total} total
              </span>
            </div>

            <div className="space-y-3">
              <TaskPriorityRow
                priority="Critical"
                count={taskCounts.critical}
                color="bg-red-500"
                textColor="text-red-400"
              />
              <TaskPriorityRow
                priority="High"
                count={taskCounts.high}
                color="bg-amber-500"
                textColor="text-amber-400"
              />
              <TaskPriorityRow
                priority="Medium"
                count={taskCounts.medium}
                color="bg-cyan-500"
                textColor="text-cyan-400"
              />
              <TaskPriorityRow
                priority="Low"
                count={taskCounts.low}
                color="bg-slate-500"
                textColor="text-slate-400"
              />
            </div>
          </section>
        )}

        {/* Recent Audit Events */}
        {visibleSections.includes('recentAudit') && (
          <section aria-label="Recent audit events" className="card p-card-padding">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              <h2 className="text-heading-3 text-text-primary">Recent Activity</h2>
            </div>

            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div
                  key={event.auditEventId}
                  className="flex items-start gap-3 py-2 border-b border-slate-700/50 last:border-b-0"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      ACTION_DOT_COLORS[event.action] || 'bg-slate-500'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text-primary font-medium truncate">
                      {ACTION_LABELS[event.action] || event.action}
                    </p>
                    <p className="text-[11px] text-text-secondary truncate">
                      {event.reason}
                    </p>
                    <p className="text-[11px] text-text-tertiary mt-0.5">
                      {event.actor} · {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function TaskPriorityRow({
  priority,
  count,
  color,
  textColor,
}: {
  priority: string;
  count: number;
  color: string;
  textColor: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} aria-hidden="true" />
      <span className="text-body text-text-secondary flex-1">{priority}</span>
      <span className={`text-body font-semibold tabular-nums ${textColor}`}>
        {count}
      </span>
    </div>
  );
}

export default DashboardPage;
