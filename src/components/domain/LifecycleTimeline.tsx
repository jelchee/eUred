import { useState } from 'react';
import { cn } from '@/lib/cn';
import { TimelineEvent } from '@/components/shared/TimelineEvent';
import type { LifecycleEvent, EventCategory } from '@/types';

interface LifecycleTimelineProps {
  events: LifecycleEvent[];
  filterCategory?: EventCategory;
  className?: string;
}

const FILTER_TABS: { label: string; value: EventCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Production', value: 'production' },
  { label: 'Operational', value: 'operational' },
  { label: 'Service', value: 'service' },
  { label: 'Compliance', value: 'compliance' },
];

export function LifecycleTimeline({
  events,
  filterCategory,
  className,
}: LifecycleTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<EventCategory | 'all'>(
    filterCategory ?? 'all'
  );

  // Filter events by category
  const filteredEvents =
    activeFilter === 'all'
      ? events
      : events.filter((e) => e.category === activeFilter);

  // Sort events by timestamp descending (most recent first)
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter tabs */}
      <nav
        className="flex flex-wrap gap-1 rounded-lg bg-slate-800/50 p-1"
        role="tablist"
        aria-label="Filter lifecycle events by category"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeFilter === tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeFilter === tab.value
                ? 'bg-slate-700 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Timeline */}
      <div role="list" aria-label="Lifecycle events">
        {sortedEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No events found for the selected category.
          </p>
        ) : (
          sortedEvents.map((event, index) => (
            <TimelineEvent
              key={event.id}
              timestamp={event.timestamp}
              title={formatEventType(event.type)}
              description={event.description}
              actor={event.actor}
              source={event.source}
              category={event.category}
              isLast={index === sortedEvents.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}

/** Convert snake_case event type to human-readable title */
function formatEventType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
