import { cn } from '@/lib/cn';
import type { RecycledContent } from '@/types';
import type { AttributeStatus } from '@/types';

interface RecycledContentBarListProps {
  data: RecycledContent[];
  className?: string;
}

const STATUS_COLORS: Record<AttributeStatus, { bar: string; text: string }> = {
  verified: { bar: 'bg-emerald-400', text: 'text-emerald-400' },
  provided: { bar: 'bg-cyan-400', text: 'text-cyan-400' },
  draft: { bar: 'bg-amber-400', text: 'text-amber-400' },
  missing: { bar: 'bg-red-400', text: 'text-red-400' },
  expired: { bar: 'bg-red-400', text: 'text-red-400' },
  not_applicable: { bar: 'bg-slate-600', text: 'text-slate-500' },
};

export function RecycledContentBarList({
  data,
  className,
}: RecycledContentBarListProps) {
  return (
    <div className={cn('space-y-3', className)} role="list" aria-label="Recycled content by material">
      {data.map((item) => {
        const colors = STATUS_COLORS[item.status] ?? STATUS_COLORS.missing;
        const percentage = item.percentage;
        const isApplicable = item.applicable && percentage !== null;

        return (
          <div key={item.material} className="space-y-1" role="listitem">
            {/* Label row */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-200">{item.material}</span>
              <span className="flex items-center gap-2">
                {isApplicable ? (
                  <span className={cn('font-mono text-xs tabular-nums', colors.text)}>
                    {percentage}%
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">N/A</span>
                )}
                <span className="text-[10px] text-slate-500">{item.source}</span>
              </span>
            </div>

            {/* Bar */}
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
              role="progressbar"
              aria-valuenow={isApplicable ? percentage! : 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${item.material}: ${isApplicable ? `${percentage}%` : 'not applicable'}`}
            >
              {isApplicable && (
                <div
                  className={cn('h-full rounded-full transition-all', colors.bar)}
                  style={{ width: `${Math.min(percentage!, 100)}%` }}
                />
              )}
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'inline-block h-1.5 w-1.5 rounded-full',
                  colors.bar
                )}
                aria-hidden="true"
              />
              <span className="text-[10px] capitalize text-slate-500">
                {item.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
