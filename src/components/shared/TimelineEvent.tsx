import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { EventCategory } from '@/types';

interface TimelineEventProps {
  timestamp: string;
  title: string;
  description?: string;
  actor?: string;
  source?: 'BMS' | 'manual' | 'system' | 'supplier';
  category?: EventCategory;
  isLast?: boolean;
  className?: string;
}

const CATEGORY_COLORS: Record<EventCategory, string> = {
  production: 'bg-cyan-400',
  operational: 'bg-emerald-400',
  service: 'bg-amber-400',
  compliance: 'bg-purple-400',
};

const CATEGORY_RING_COLORS: Record<EventCategory, string> = {
  production: 'ring-cyan-400/30',
  operational: 'ring-emerald-400/30',
  service: 'ring-amber-400/30',
  compliance: 'ring-purple-400/30',
};

const SOURCE_LABELS: Record<NonNullable<TimelineEventProps['source']>, string> = {
  BMS: 'BMS',
  manual: 'Manual',
  system: 'System',
  supplier: 'Supplier',
};

function isAutoSource(source?: TimelineEventProps['source']): boolean {
  return source === 'BMS' || source === 'system';
}

export function TimelineEvent({
  timestamp,
  title,
  description,
  actor,
  source,
  category = 'operational',
  isLast = false,
  className,
}: TimelineEventProps) {
  const dotColor = CATEGORY_COLORS[category];
  const ringColor = CATEGORY_RING_COLORS[category];

  return (
    <div className={cn('relative flex gap-4', className)}>
      {/* Timeline rail */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div
          className={cn(
            'relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full ring-4',
            dotColor,
            ringColor
          )}
          aria-hidden="true"
        />
        {/* Connecting line */}
        {!isLast && (
          <div className="w-px flex-1 bg-slate-700/50" aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div className={cn('pb-6', isLast && 'pb-0')}>
        {/* Timestamp */}
        <time className="text-[11px] text-slate-500" dateTime={timestamp}>
          {formatTimestamp(timestamp)}
        </time>

        {/* Title */}
        <h4 className="mt-0.5 text-sm font-medium text-slate-200">{title}</h4>

        {/* Description */}
        {description && (
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        )}

        {/* Meta row: actor + source badge */}
        {(actor || source) && (
          <div className="mt-2 flex items-center gap-2">
            {actor && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                {isAutoSource(source) ? (
                  <Bot className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <User className="h-3 w-3" aria-hidden="true" />
                )}
                {actor}
              </span>
            )}
            {source && (
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                {SOURCE_LABELS[source]}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
