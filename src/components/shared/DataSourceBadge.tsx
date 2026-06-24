import { Database } from 'lucide-react';
import { cn } from '@/lib/cn';

export type DataSourceLabel =
  | 'Manual Entry'
  | 'CSV Demo Import'
  | 'Mock API Import'
  | 'Supplier Submission'
  | 'Telemetry Simulator';

interface DataSourceBadgeProps {
  source: DataSourceLabel;
  className?: string;
}

/**
 * DataSourceBadge — Small informational badge indicating the origin of data
 * displayed on a page or section. Used to clearly communicate where demo data
 * came from per FR-DI-014 / NFR-002.
 *
 * @validates FR-DI-014 — Data provenance labelling
 * @validates NFR-002 — Demo transparency
 */
export function DataSourceBadge({ source, className }: DataSourceBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md bg-slate-700/50 px-2.5 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-inset ring-slate-600/50',
        className,
      )}
      role="status"
      aria-label={`Data source: ${source}`}
    >
      <Database className="h-3 w-3 text-accent-cyan" aria-hidden="true" />
      {source}
    </span>
  );
}
