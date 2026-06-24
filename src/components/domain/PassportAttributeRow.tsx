import React from 'react';
import { cn } from '@/lib/cn';
import { StatusBadge } from '@/components/shared';
import type { PassportAttribute, ConfidenceLevel, DataSource } from '@/types/passport';

export interface PassportAttributeRowProps {
  attribute: PassportAttribute;
  className?: string;
}

/**
 * Human-readable labels for data sources.
 */
const SOURCE_LABELS: Record<DataSource, string> = {
  manual: 'Manual Entry',
  BMS: 'BMS',
  ERP: 'ERP',
  MES: 'MES',
  supplier_declaration: 'Supplier Declaration',
  document_upload: 'Document Upload',
  calculated: 'Calculated',
  simulated: 'Simulated',
  platform: 'Platform',
  public_spec: 'Public Spec',
};

/**
 * Confidence level color mapping: high=emerald, medium=amber, low=red.
 * Tooltip explains this is simulated confidence for demo purposes (NFR-002).
 */
const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { color: string; label: string; tooltip: string }> = {
  high: { color: 'bg-emerald-400', label: 'High confidence', tooltip: 'High confidence — Synthetic demo data (simulated confidence level)' },
  medium: { color: 'bg-amber-400', label: 'Medium confidence', tooltip: 'Medium confidence — Synthetic demo data (simulated confidence level)' },
  low: { color: 'bg-red-400', label: 'Low confidence', tooltip: 'Low confidence — Synthetic demo data (simulated confidence level)' },
};

/**
 * Renders a confidence indicator as 3 dots with the appropriate number filled.
 */
function ConfidenceIndicator({ level }: { level: ConfidenceLevel }) {
  const config = CONFIDENCE_CONFIG[level];
  const filledCount = level === 'high' ? 3 : level === 'medium' ? 2 : 1;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={config.label}
      title={config.tooltip}
    >
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            'h-2 w-2 rounded-full',
            i <= filledCount ? config.color : 'bg-slate-600',
          )}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{config.label}</span>
    </div>
  );
}

/**
 * Formats the attribute value with its unit for display.
 */
function formatValue(value: PassportAttribute['value'], unit?: string): string {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  const str = String(value);
  return unit ? `${str} ${unit}` : str;
}

/**
 * PassportAttributeRow — Displays a single passport attribute with its status badge,
 * data source label, and confidence indicator.
 *
 * @validates FR-003 — Private Passport View attribute display
 * @validates FR-004 — Compliance Gap Analyzer attribute status
 */
export const PassportAttributeRow: React.FC<PassportAttributeRowProps> = ({
  attribute,
  className,
}) => {
  const { name, value, unit, status, source, confidence } = attribute;

  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3',
        'border-b border-border last:border-b-0',
        'hover:bg-background-surface/50 transition-colors',
        className,
      )}
    >
      {/* Name and value */}
      <div className="min-w-0">
        <p className="text-body text-text-primary truncate">{name}</p>
        <p className="text-caption text-text-secondary truncate mt-0.5">
          {formatValue(value, unit)}
        </p>
      </div>

      {/* Status badge */}
      <StatusBadge status={status} size="xs" showIcon />

      {/* Source label */}
      <span className="text-caption text-text-tertiary whitespace-nowrap">
        {SOURCE_LABELS[source]}
      </span>

      {/* Confidence indicator */}
      <ConfidenceIndicator level={confidence} />
    </div>
  );
};

export default PassportAttributeRow;
