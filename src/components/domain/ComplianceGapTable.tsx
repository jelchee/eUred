import { useMemo, useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { StatusBadge } from '@/components/shared';
import type { PassportAttribute, AttributeStatus, PassportSection } from '@/types';

export interface ComplianceGapTableProps {
  attributes: PassportAttribute[];
  onFilterChange?: (filter: string) => void;
  onCreateTask?: (attributeId: string) => void;
  showConfidence?: boolean;
  className?: string;
}

type FilterStatus = 'all' | AttributeStatus;

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'missing', label: 'Missing' },
  { value: 'draft', label: 'Draft' },
  { value: 'provided', label: 'Provided' },
  { value: 'verified', label: 'Verified' },
  { value: 'expired', label: 'Expired' },
];

/** Section order for grouping */
const SECTION_ORDER: PassportSection[] = [
  'Identity',
  'Manufacturer',
  'Technical',
  'Chemistry',
  'Carbon Footprint',
  'Recycled Content',
  'Performance',
  'State of Health',
  'Due Diligence',
  'Safety',
  'End of Life',
  'Documents',
  'Audit',
];

/** Confidence level display config */
const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-emerald-400',
  medium: 'text-amber-400',
  low: 'text-red-400',
};

/**
 * ComplianceGapTable — Filterable table showing passport attribute completion status,
 * grouped by section, with gap highlighting and task creation.
 *
 * @validates FR-004 — Compliance Gap Analyzer: top 5 gaps, create task for gaps
 */
export function ComplianceGapTable({
  attributes,
  onFilterChange,
  onCreateTask,
  showConfidence = true,
  className,
}: ComplianceGapTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  // Compute top 5 gaps (missing + draft attributes)
  const topGaps = useMemo(() => {
    return attributes
      .filter((attr) => attr.status === 'missing' || attr.status === 'draft')
      .slice(0, 5);
  }, [attributes]);

  // Filter attributes based on active filter
  const filteredAttributes = useMemo(() => {
    if (activeFilter === 'all') return attributes;
    return attributes.filter((attr) => attr.status === activeFilter);
  }, [attributes, activeFilter]);

  // Group filtered attributes by section
  const groupedAttributes = useMemo(() => {
    const groups = new Map<PassportSection, PassportAttribute[]>();

    for (const section of SECTION_ORDER) {
      const sectionAttrs = filteredAttributes.filter(
        (attr) => attr.section === section
      );
      if (sectionAttrs.length > 0) {
        groups.set(section, sectionAttrs);
      }
    }

    return groups;
  }, [filteredAttributes]);

  function handleFilterChange(filter: FilterStatus) {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  }

  // Compute stats for summary
  const stats = useMemo(() => {
    const total = attributes.length;
    const missing = attributes.filter((a) => a.status === 'missing').length;
    const draft = attributes.filter((a) => a.status === 'draft').length;
    const verified = attributes.filter((a) => a.status === 'verified').length;
    return { total, missing, draft, verified };
  }, [attributes]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Top 5 Gaps Summary Panel */}
      {topGaps.length > 0 && (
        <div className="card border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <h4 className="text-sm font-medium text-amber-400">
              Top {topGaps.length} Compliance Gaps
            </h4>
          </div>
          <ul className="space-y-2" role="list" aria-label="Top compliance gaps">
            {topGaps.map((gap) => (
              <li
                key={gap.attributeId}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <StatusBadge status={gap.status} size="xs" showIcon />
                  <span className="text-text-primary truncate">{gap.name}</span>
                  <span className="text-text-tertiary text-xs hidden sm:inline">
                    ({gap.section})
                  </span>
                </div>
                {onCreateTask &&
                  (gap.status === 'missing' || gap.status === 'draft') && (
                    <button
                      type="button"
                      onClick={() => onCreateTask(gap.attributeId)}
                      className="shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-accent-cyan hover:text-accent-cyan-light hover:bg-accent-cyan/10 rounded-button transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan"
                      aria-label={`Create task for ${gap.name}`}
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      Task
                    </button>
                  )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by status">
        {FILTER_OPTIONS.map(({ value, label }) => {
          const count =
            value === 'all'
              ? stats.total
              : attributes.filter((a) => a.status === value).length;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleFilterChange(value)}
              aria-pressed={activeFilter === value}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-button border transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan',
                activeFilter === value
                  ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-surface border-border'
              )}
            >
              {label}
              <span className="ml-1.5 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grouped Attribute Table */}
      <div className="space-y-4">
        {Array.from(groupedAttributes.entries()).map(([section, attrs]) => (
          <div key={section} className="card">
            <h4 className="text-sm font-medium text-text-primary mb-3">
              {section}
              <span className="ml-2 text-text-tertiary font-normal">
                ({attrs.length} attributes)
              </span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label={`${section} attributes`}>
                <thead>
                  <tr className="border-b border-border text-text-tertiary text-left">
                    <th scope="col" className="pb-2 pr-4 font-medium">
                      Attribute
                    </th>
                    <th scope="col" className="pb-2 pr-4 font-medium">
                      Status
                    </th>
                    <th scope="col" className="pb-2 pr-4 font-medium">
                      Source
                    </th>
                    {showConfidence && (
                      <th scope="col" className="pb-2 pr-4 font-medium">
                        Confidence
                      </th>
                    )}
                    <th scope="col" className="pb-2 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {attrs.map((attr) => (
                    <tr
                      key={attr.attributeId}
                      className={cn(
                        'hover:bg-background-surface/50 transition-colors',
                        attr.status === 'missing' && 'bg-red-500/[0.03]'
                      )}
                    >
                      <td className="py-2.5 pr-4">
                        <span className="text-text-primary">{attr.name}</span>
                        {attr.value != null && (
                          <span className="ml-2 text-text-tertiary text-xs">
                            {String(attr.value)}
                            {attr.unit ? ` ${attr.unit}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={attr.status} size="xs" showIcon />
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="text-text-secondary text-xs capitalize">
                          {attr.source.replace(/_/g, ' ')}
                        </span>
                      </td>
                      {showConfidence && (
                        <td className="py-2.5 pr-4">
                          <span
                            className={cn(
                              'text-xs capitalize',
                              CONFIDENCE_COLORS[attr.confidence] ?? 'text-text-tertiary'
                            )}
                          >
                            {attr.confidence}
                          </span>
                        </td>
                      )}
                      <td className="py-2.5 text-right">
                        {onCreateTask &&
                          (attr.status === 'missing' || attr.status === 'draft') && (
                            <button
                              type="button"
                              onClick={() => onCreateTask(attr.attributeId)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-accent-cyan hover:text-accent-cyan-light hover:bg-accent-cyan/10 rounded-button transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan"
                              aria-label={`Create task for ${attr.name}`}
                            >
                              <Plus className="h-3 w-3" aria-hidden="true" />
                              Create Task
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {groupedAttributes.size === 0 && (
          <div className="card text-center py-8">
            <p className="text-text-secondary text-sm">
              No attributes match the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplianceGapTable;
