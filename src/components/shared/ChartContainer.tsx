import type { TimeRange } from '@/types';
import { cn } from '@/lib/cn';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  showTimeSelector?: boolean;
  height?: number;
  className?: string;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
];

/**
 * ChartContainer — card wrapper with title, optional time range selector,
 * and a responsive container for chart content.
 *
 * @validates NFR-006 — Accessible contrast, keyboard focus, readable on laptop/tablet
 * @validates FR-005 — Telemetry visualization support
 */
export function ChartContainer({
  title,
  children,
  timeRange = '7d',
  onTimeRangeChange,
  showTimeSelector = false,
  height = 300,
  className,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'card flex flex-col gap-3',
        className
      )}
    >
      {/* Header: title + optional time range buttons */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-heading-3 text-text-primary truncate">{title}</h3>

        {showTimeSelector && (
          <div className="flex items-center gap-1" role="group" aria-label="Time range selector">
            {TIME_RANGES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onTimeRangeChange?.(value)}
                aria-pressed={timeRange === value}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-button transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cyan',
                  timeRange === value
                    ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated border border-transparent'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart content area — responsive sizing */}
      <div
        className="w-full flex-1 min-w-0"
        style={{ minHeight: height }}
      >
        {children}
      </div>
    </div>
  );
}
