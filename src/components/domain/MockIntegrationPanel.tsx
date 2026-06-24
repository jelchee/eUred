import { useCallback } from 'react';
import {
  Layers,
  Factory,
  Database,
  ShieldCheck,
  Activity,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store';
import { createAuditEvent } from '@/lib/auditLogger';
import type { IntegrationSystem, MockIntegration } from '@/types';

export interface MockIntegrationPanelProps {
  assetId?: string;
  className?: string;
}

/** Map icon string names from integration config to lucide-react components */
const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Factory,
  Database,
  ShieldCheck,
  Activity,
  FileText,
};

/** Status badge color mapping */
const STATUS_STYLES: Record<MockIntegration['status'], string> = {
  idle: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  syncing: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_LABELS: Record<MockIntegration['status'], string> = {
  idle: 'Idle',
  syncing: 'Syncing…',
  success: 'Connected',
  error: 'Error',
};

/**
 * MockIntegrationPanel — Displays a card grid for each mock integration system
 * (PLM, MES, ERP, QMS, BMS, Document Vault). Each card allows triggering a
 * simulated import that populates passport fields, updates completeness, and
 * creates an audit event.
 *
 * Validates: Requirements FR-DI-005, FR-DI-010, FR-DI-014
 */
export function MockIntegrationPanel({ assetId = 'asset-001', className }: MockIntegrationPanelProps) {
  const integrationStatuses = useAppStore((s) => s.integrationStatuses);
  const triggerMockImport = useAppStore((s) => s.triggerMockImport);
  const recalculateCompleteness = useAppStore((s) => s.recalculateCompleteness);

  const handleImport = useCallback(
    (system: IntegrationSystem) => {
      // Trigger the store-level mock import (sets syncing → success after 1.5s)
      triggerMockImport(system, assetId);

      // Create an audit trail event for the import
      const integration = integrationStatuses[system];

      // Recalculate completeness score for the asset
      recalculateCompleteness(assetId, `mock_api_import: ${integration.label}`);

      createAuditEvent({
        action: 'MOCK_API_IMPORT',
        entityType: 'ASSET',
        entityId: assetId,
        actor: 'system',
        actorRole: 'ADMIN',
        reason: `Mock import triggered from ${integration.label}`,
        dataSource: system === 'BMS' ? 'BMS' : system === 'ERP' ? 'ERP' : system === 'MES' ? 'MES' : 'manual',
        affectedFields: integration.fieldsPopulated,
        scoreImpact: integration.fieldsPopulated.length,
      });
    },
    [triggerMockImport, recalculateCompleteness, assetId, integrationStatuses],
  );

  const systems = Object.values(integrationStatuses);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h3 className="text-heading-3 text-text-primary">Mock Integration Panel</h3>
        <p className="text-xs text-text-tertiary mt-1">
          Simulate data imports from enterprise systems. Each import populates relevant passport fields.
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {systems.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onImport={handleImport}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Integration Card ────────────────────────────────────────────────────────

interface IntegrationCardProps {
  integration: MockIntegration;
  onImport: (system: IntegrationSystem) => void;
}

function IntegrationCard({ integration, onImport }: IntegrationCardProps) {
  const { system, label, description, icon, status, lastSync, fieldsPopulated, dataPreview } = integration;
  const Icon = ICON_MAP[icon] ?? Layers;
  const isSyncing = status === 'syncing';

  return (
    <div
      className={cn(
        'relative rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 transition-all duration-200',
        'hover:border-slate-600/80 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-cyan-500/5',
      )}
    >
      {/* Top row: icon + label + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 rounded-lg bg-slate-700/50 p-2">
            <Icon className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-text-primary truncate">{label}</h4>
            <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">{description}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Last sync */}
      {lastSync && (
        <p className="text-[10px] text-text-tertiary mb-3">
          Last sync: {new Date(lastSync).toLocaleString()}
        </p>
      )}

      {/* Fields populated */}
      <div className="mb-3">
        <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1.5">
          Fields Populated
        </p>
        <div className="flex flex-wrap gap-1">
          {fieldsPopulated.map((field) => (
            <span
              key={field}
              className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            >
              {field}
            </span>
          ))}
        </div>
      </div>

      {/* Data Preview */}
      {Object.keys(dataPreview).length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider mb-1.5">
            Data Preview
          </p>
          <div className="rounded-md border border-slate-700/40 bg-slate-900/40 overflow-hidden">
            <table className="w-full text-[10px]">
              <tbody>
                {Object.entries(dataPreview).map(([key, value]) => (
                  <tr key={key} className="border-b border-slate-700/30 last:border-b-0">
                    <td className="px-2 py-1 text-text-tertiary font-medium whitespace-nowrap">{key}</td>
                    <td className="px-2 py-1 text-text-secondary text-right">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import button */}
      <button
        onClick={() => onImport(system)}
        disabled={isSyncing}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
          isSyncing
            ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400/50 cursor-not-allowed'
            : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/40',
        )}
        aria-label={`Import data from ${label}`}
      >
        {isSyncing ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Importing…
          </>
        ) : (
          <>
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            Import
          </>
        )}
      </button>
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MockIntegration['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
        STATUS_STYLES[status],
      )}
    >
      {status === 'syncing' && <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden="true" />}
      {status === 'success' && <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />}
      {status === 'error' && <XCircle className="h-2.5 w-2.5" aria-hidden="true" />}
      {STATUS_LABELS[status]}
    </span>
  );
}
