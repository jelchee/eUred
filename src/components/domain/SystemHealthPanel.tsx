import { Activity, Database, Globe, Upload, Shield, Hash } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SystemHealth } from '@/types';

export interface SystemHealthPanelProps {
  className?: string;
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  'Ingest Service': Upload,
  'API Gateway': Globe,
  'Database': Database,
  'Export Queue': Activity,
  'Auth Service': Shield,
};

const STATUS_STYLES: Record<SystemHealth['status'], { bg: string; text: string; dot: string; label: string }> = {
  healthy: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'Healthy',
  },
  degraded: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
    label: 'Degraded',
  },
  down: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-500',
    label: 'Down',
  },
};

// Mock service health data (as specified in NFR-005)
const MOCK_SERVICES: SystemHealth[] = [
  {
    service: 'Ingest Service',
    status: 'healthy',
    latency: 42,
    lastCheck: new Date().toISOString(),
    uptime: 99.97,
    traceId: 'trc_ingest_01847',
  },
  {
    service: 'API Gateway',
    status: 'healthy',
    latency: 18,
    lastCheck: new Date().toISOString(),
    uptime: 99.99,
    traceId: 'trc_api_01848',
  },
  {
    service: 'Database',
    status: 'healthy',
    latency: 5,
    lastCheck: new Date().toISOString(),
    uptime: 99.99,
    traceId: 'trc_db_01849',
  },
  {
    service: 'Export Queue',
    status: 'degraded',
    latency: 320,
    lastCheck: new Date().toISOString(),
    uptime: 98.42,
    traceId: 'trc_export_01850',
  },
  {
    service: 'Auth Service',
    status: 'healthy',
    latency: 25,
    lastCheck: new Date().toISOString(),
    uptime: 99.98,
    traceId: 'trc_auth_01851',
  },
];

/**
 * SystemHealthPanel — Service status cards for platform health.
 * Displays mock service statuses with indicators (healthy=green, degraded=amber, down=red),
 * latency, uptime percentage, and trace ID.
 *
 * Validates: Requirements NFR-005
 */
export function SystemHealthPanel({ className }: SystemHealthPanelProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-heading-3 text-text-primary">Platform Health</h3>
        <span className="text-xs text-text-tertiary">
          Last check: {new Date().toLocaleTimeString('en-GB')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_SERVICES.map((svc) => {
          const style = STATUS_STYLES[svc.status];
          const Icon = SERVICE_ICONS[svc.service] ?? Activity;

          return (
            <div
              key={svc.service}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                  <span className="text-sm font-medium text-text-primary">
                    {svc.service}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn('w-2 h-2 rounded-full', style.dot)}
                    aria-hidden="true"
                  />
                  <span className={cn('text-xs font-medium', style.text)}>
                    {style.label}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-text-tertiary block">Latency</span>
                  <span className="text-sm text-text-primary font-mono">
                    {svc.latency != null ? `${svc.latency}ms` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-text-tertiary block">Uptime</span>
                  <span className="text-sm text-text-primary font-mono">
                    {svc.uptime.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Trace ID */}
              <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center gap-1">
                <Hash className="h-3 w-3 text-text-tertiary" aria-hidden="true" />
                <span className="text-[10px] text-text-tertiary font-mono">
                  {svc.traceId}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
